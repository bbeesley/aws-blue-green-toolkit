import { AuroraTools, StackReference } from '../main';
import * as AWS from 'aws-sdk';

const config = {
  awsRegion: 'eu-central-1',
  awsProfile: '555',
  environment: 'dev',
  namespace: 'fn',
  tags: {},
  clusterNameA: 'fn-db-a-dev',
  clusterNameB: 'fn-db-b-dev',
  minimumClusterSize: 1,
  skipDeleteSnapshots: true,
};

const auroraTools = new AuroraTools(config);

describe('AuroraTools', () => {
  describe('getClusterState', () => {
    it('calls describeDBClusters with expected params', async () => {
      await auroraTools.getClusterState(StackReference.b);
      expect(AWS.RDS._describeDBClusters).toHaveBeenCalledWith({
        DBClusterIdentifier: config.clusterNameB,
      });
    });
    it('returns the current state of the cluster', async () => {
      const status = await auroraTools.getClusterState(StackReference.b);
      expect(status).toEqual('stopped');
    });
  });
  describe('scaleIn', () => {
    it('calls registerScalableTarget with the expected params', async () => {
      await auroraTools.scaleIn(StackReference.b);
      expect(
        AWS.ApplicationAutoScaling._registerScalableTarget
      ).toHaveBeenCalledWith({
        ResourceId: 'cluster:fn-db-b-dev',
        ScalableDimension: 'rds:cluster:ReadReplicaCount',
        ServiceNamespace: 'rds',
        MinCapacity: 1,
      });
    });
  });
  describe('scaleOut', () => {
    it('calls registerScalableTarget with the expected params', async () => {
      await auroraTools.scaleOut(StackReference.b);
      expect(
        AWS.ApplicationAutoScaling._registerScalableTarget
      ).toHaveBeenCalledWith({
        ResourceId: 'cluster:fn-db-b-dev',
        ScalableDimension: 'rds:cluster:ReadReplicaCount',
        ServiceNamespace: 'rds',
        MinCapacity: 2,
      });
    });
  });
});
