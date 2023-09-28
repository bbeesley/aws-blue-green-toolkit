import {
  AddTagsToResourceCommand,
  DescribeDBInstancesCommand,
  ModifyDBInstanceCommand,
  RDSServiceException,
} from '@aws-sdk/client-rds';
import test from 'ava';

import {
  AuroraTools,
  ClusterState,
  StackReference,
} from '../../dist/esm/index.js';
import { awsMocks, resetMocks } from './mock-aws.js';

test.serial.beforeEach(() => {
  resetMocks();
});

const config = {
  awsRegion: 'eu-central-1',
  awsProfile: '555',
  environment: 'dev',
  namespace: 'fn',
  tags: {
    foo: 'bar',
  },
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

test.serial(
  'AuroraTools > enablePerformanceInsights > retries after 60s if instance not ready',
  async (t) => {
    t.timeout(5e3);
    const error = new RDSServiceException({
      message:
        'InvalidDBInstanceState: Database instance is not in available state.',
    });
    error.name = 'InvalidDBInstanceState';
    error.Code = 'InvalidDBInstanceState';
    awsMocks.mockRds.on(ModifyDBInstanceCommand).rejectsOnce(error);
    const startTime = Date.now();
    await auroraTools.enablePerformanceInsights(
      {
        Sns: {
          Message:
            '{"Event Source":"db-instance","Event Time":"2022-08-26 13:29:19.857","Identifier Link":"https://console.aws.amazon.com/rds/home?region=us-east-1#dbinstance:id=application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ID":"application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ARN":"arn:aws:rds:us-east-1:000000000000:db:application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Event ID":"http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.html#RDS-EVENT-0003","Event Message":"DB instance created"}',
        },
      },
      true,
      2e3
    );
    t.is(awsMocks.mockRds.commandCalls(ModifyDBInstanceCommand).length, 2);
    t.snapshot(
      awsMocks.mockRds
        .commandCalls(ModifyDBInstanceCommand)
        .map((element) => element.args[0].input)
    );
    t.true(Date.now() - startTime > 2e3);
  }
);

test.serial(
  'AuroraTools > enablePerformanceInsights > calls ModifyDBInstanceCommand with expected params when triggered from a disable event',
  async (t) => {
    await auroraTools.enablePerformanceInsights({
      Sns: {
        Message:
          '{"Event Source":"db-instance","Event Time":"2022-08-26 13:29:19.857","Identifier Link":"https://console.aws.amazon.com/rds/home?region=us-east-1#dbinstance:id=application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ID":"application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ARN":"arn:aws:rds:us-east-1:000000000000:db:application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Event ID":"http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.html#RDS-EVENT-0003","Event Message":"Performance Insights has been disabled"}',
      },
    });
    t.true(awsMocks.mockRds.send.calledTwice);
    t.snapshot(awsMocks.mockRds.calls()[1].args[0].input);
  }
);

test.serial(
  'AuroraTools > enablePerformanceInsights > does nothing when triggered from a disable event if `reEnableIfDisabled` is false',
  async (t) => {
    await auroraTools.enablePerformanceInsights(
      {
        Sns: {
          Message:
            '{"Event Source":"db-instance","Event Time":"2022-08-26 13:29:19.857","Identifier Link":"https://console.aws.amazon.com/rds/home?region=us-east-1#dbinstance:id=application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ID":"application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ARN":"arn:aws:rds:us-east-1:000000000000:db:application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Event ID":"http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.html#RDS-EVENT-0003","Event Message":"Performance Insights has been disabled"}',
        },
      },
      false
    );
    t.false(awsMocks.mockRds.send.called);
  }
);

test.serial(
  'AuroraTools > getTagsForCluster > fetches tags for the cluster when passed an instance ARN',
  async (t) => {
    const tags = await auroraTools.getTagsForCluster(
      'arn:aws:rds:eu-central-1:555:db:application-autoscaling-foo'
    );
    t.snapshot(tags);
  }
);

test.serial(
  'AuroraTools > applyTags > uses tags from config if defined',
  async (t) => {
    await auroraTools.applyTags({
      Sns: {
        Message:
          '{"Event Source":"db-instance","Event Time":"2022-08-26 13:29:19.857","Identifier Link":"https://console.aws.amazon.com/rds/home?region=us-east-1#dbinstance:id=application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ID":"application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ARN":"arn:aws:rds:us-east-1:000000000000:db:application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Event ID":"http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.html#RDS-EVENT-0003","Event Message":"DB instance created"}',
      },
    });

    const calls = awsMocks.mockRds.calls();
    t.is(calls.length, 2);
    const addTagsCommand = calls.find(
      (c) => c.args[0] instanceof AddTagsToResourceCommand
    ).args[0];
    t.snapshot(addTagsCommand.input.Tags);
  }
);

test.serial(
  'AuroraTools > applyTags > ignores namespace when set to *',
  async (t) => {
    awsMocks.mockRds.on(DescribeDBInstancesCommand).resolves({
      DBInstances: [
        {
          DBInstanceIdentifier:
            'application-autoscaling-4d74caa0-c3ab-4979-9fd9-2b726f18c357',
          DBClusterIdentifier: 'arn:aws:rds:eu-central-1:555:cluster:not-fn',
          DBInstanceClass: 'db.r6g.xlarge',
          Engine: 'aurora-postgresql',
          DBInstanceStatus: 'available',
          PerformanceInsightsEnabled: false,
        },
      ],
    });
    const noNamespaceTools = new AuroraTools({
      ...config,
      namespace: '*',
    });
    await noNamespaceTools.applyTags({
      Sns: {
        Message:
          '{"Event Source":"db-instance","Event Time":"2022-08-26 13:29:19.857","Identifier Link":"https://console.aws.amazon.com/rds/home?region=us-east-1#dbinstance:id=application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ID":"application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ARN":"arn:aws:rds:us-east-1:000000000000:db:application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Event ID":"http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.html#RDS-EVENT-0003","Event Message":"DB instance created"}',
      },
    });

    const calls = awsMocks.mockRds.calls();
    t.is(calls.length, 2);
    const addTagsCommand = calls.find(
      (c) => c.args[0] instanceof AddTagsToResourceCommand
    ).args[0];
    t.snapshot(addTagsCommand.input.Tags);
  }
);

test.serial(
  'AuroraTools > applyTags > fetches tags from cluster if not defined in config',
  async (t) => {
    const noTagsTools = new AuroraTools({
      ...config,
      tags: {},
    });
    await noTagsTools.applyTags({
      Sns: {
        Message:
          '{"Event Source":"db-instance","Event Time":"2022-08-26 13:29:19.857","Identifier Link":"https://console.aws.amazon.com/rds/home?region=us-east-1#dbinstance:id=application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ID":"application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Source ARN":"arn:aws:rds:us-east-1:000000000000:db:application-autoscaling-d1583f39-ab0b-4d73-87e4-4db2d83476b3","Event ID":"http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.html#RDS-EVENT-0003","Event Message":"DB instance created"}',
      },
    });
    const calls = awsMocks.mockRds.calls();
    t.is(calls.length, 4);
    const addTagsCommand = calls.find(
      (c) => c.args[0] instanceof AddTagsToResourceCommand
    ).args[0];
    t.snapshot(addTagsCommand.input.Tags);
  }
);
