import test from 'ava';

import { AuroraTools, ClusterState, StackReference } from '../../dist/index.js';
import { awsMocks, resetMocks } from './mockAws.js';

test.serial.beforeEach(() => {
  resetMocks();
});

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

test.serial(
  'AuroraTools scaleIn > calls registerScalableTarget with the expected params',
  async (t) => {
    await auroraTools.scaleOut(StackReference.b);
    t.true(awsMocks.mockAas.send.called);
    t.snapshot(awsMocks.mockAas.calls()[0].args[0].input);
  }
);

test.serial(
  'AuroraTools scaleOut > calls registerScalableTarget with the expected params',
  async (t) => {
    await auroraTools.scaleIn(StackReference.b);
    t.true(awsMocks.mockAas.send.called);
    t.snapshot(awsMocks.mockAas.calls()[0].args[0].input);
  }
);

test.serial(
  'AuroraTools > returns the current state of the cluster',
  async (t) => {
    const status = await auroraTools.getClusterState(StackReference.b);
    t.is(status, ClusterState.STOPPED);
  }
);

test.serial(
  'AuroraTools > calls describeDBClusters with expected params',
  async (t) => {
    await auroraTools.getClusterState(StackReference.b);
    t.deepEqual(awsMocks.mockRds.calls()[0].args[0].input, {
      DBClusterIdentifier: config.clusterNameB,
    });
  }
);
