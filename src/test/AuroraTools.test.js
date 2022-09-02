import test from 'ava';

import {
  AuroraTools,
  ClusterState,
  StackReference,
} from '../../dist/esm/index.js';
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

test.serial(
  'AuroraTools > enablePerformanceInsights > calls DescribeDBInstanceCommand with expected params',
  async (t) => {
    await auroraTools.enablePerformanceInsights({
      Sns: {
        Message:
          '{"Event Source":"db-instance","Event Time":"2022-08-26 13:29:19.857","Identifier Link":"https://console.aws.amazon.com/rds/home?region=us-east-1#dbinstance:id=application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ID":"application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ARN":"arn:aws:rds:us-east-1:000000000000:db:application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Event ID":"http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.html#RDS-EVENT-0003","Event Message":"DB instance created"}',
      },
    });
    t.true(awsMocks.mockRds.send.called);
    t.snapshot(awsMocks.mockRds.calls()[0].args[0].input);
  }
);

test.serial(
  'AuroraTools > enablePerformanceInsights > calls ModifyDBInstanceCommand with expected params',
  async (t) => {
    await auroraTools.enablePerformanceInsights({
      Sns: {
        Message:
          '{"Event Source":"db-instance","Event Time":"2022-08-26 13:29:19.857","Identifier Link":"https://console.aws.amazon.com/rds/home?region=us-east-1#dbinstance:id=application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ID":"application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ARN":"arn:aws:rds:us-east-1:000000000000:db:application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Event ID":"http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.html#RDS-EVENT-0003","Event Message":"DB instance created"}',
      },
    });
    t.true(awsMocks.mockRds.send.calledTwice);
    t.snapshot(awsMocks.mockRds.calls()[1].args[0].input);
  }
);
