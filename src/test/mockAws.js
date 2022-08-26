import {
  ApplicationAutoScalingClient,
  DescribeScalableTargetsCommand,
  RegisterScalableTargetCommand,
} from '@aws-sdk/client-application-auto-scaling';
import {
  CloudWatchClient,
  DescribeAlarmsCommand,
  GetMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import {
  CloudWatchEventsClient,
  ListRuleNamesByTargetCommand,
} from '@aws-sdk/client-cloudwatch-events';
import {
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
  DeregisterStreamConsumerCommand,
  DescribeStreamConsumerCommand,
  KinesisClient,
  RegisterStreamConsumerCommand,
} from '@aws-sdk/client-kinesis';
import {
  CreateEventSourceMappingCommand,
  DeleteEventSourceMappingCommand,
  LambdaClient,
  ListEventSourceMappingsCommand,
  UpdateEventSourceMappingCommand,
} from '@aws-sdk/client-lambda';
import {
  DescribeDBClustersCommand,
  DescribeDBInstancesCommand,
  ModifyDBInstanceCommand,
  RDSClient,
} from '@aws-sdk/client-rds';
import {
  SetSubscriptionAttributesCommand,
  SNSClient,
} from '@aws-sdk/client-sns';
import { PurgeQueueCommand, SQSClient } from '@aws-sdk/client-sqs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mockClient } from 'aws-sdk-client-mock';

const mockRds = mockClient(RDSClient);
const rdsResponses = {
  describeDBInstances: {
    DBInstances: [
      {
        DBInstanceIdentifier:
          'application-autoscaling-4d74caa0-c3ab-4979-9fd9-2b726f18c357',
        DBInstanceClass: 'db.r6g.xlarge',
        Engine: 'aurora-postgresql',
        DBInstanceStatus: 'available',
        PerformanceInsightsEnabled: false,
      },
    ],
  },
  describeDBClusters: {
    DBClusters: [
      {
        AllocatedStorage: 1,
        AvailabilityZones: ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'],
        BackupRetentionPeriod: 5,
        DatabaseName: 'fn',
        DBClusterIdentifier: 'fn-db-b-dev',
        DBClusterParameterGroup: 'fn-db-b-dev',
        DBSubnetGroup: 'fn-db-b-dev',
        Status: 'stopped',
        EarliestRestorableTime: '2019-12-19T20:18:31.111Z',
        Endpoint:
          'fn-db-b-dev.cluster-0f0b5ec26c5f.eu-central-1.rds.amazonaws.com',
        ReaderEndpoint:
          'fn-db-b-dev.cluster-ro-0f0b5ec26c5f.eu-central-1.rds.amazonaws.com',
        CustomEndpoints: [],
        MultiAZ: true,
        Engine: 'aurora-postgresql',
        EngineVersion: '10.7',
        LatestRestorableTime: '2019-12-24T20:50:42.030Z',
        Port: 5432,
        MasterUsername: 'postgres',
        DBClusterOptionGroupMemberships: [],
        PreferredBackupWindow: '07:00-09:00',
        PreferredMaintenanceWindow: 'wed:03:00-wed:04:00',
        ReadReplicaIdentifiers: [],
        DBClusterMembers: [
          {
            DBInstanceIdentifier:
              'application-autoscaling-ddfc94a1-29af-4d17-b497-0f0b5ec26c5f',
            IsClusterWriter: false,
            DBClusterParameterGroupStatus: 'in-sync',
            PromotionTier: 15,
          },
          {
            DBInstanceIdentifier:
              'application-autoscaling-90ba4e59-e2df-488c-bbab-73422e4edea7',
            IsClusterWriter: false,
            DBClusterParameterGroupStatus: 'in-sync',
            PromotionTier: 15,
          },
          {
            DBInstanceIdentifier: 'fn-db-b-dev-1',
            IsClusterWriter: true,
            DBClusterParameterGroupStatus: 'in-sync',
            PromotionTier: 0,
          },
        ],
        VpcSecurityGroups: [
          { VpcSecurityGroupId: 'sg-bd3274a02951', Status: 'active' },
        ],
        HostedZoneId: 'FOOBARBAZBATFF',
        StorageEncrypted: false,
        DbClusterResourceId: 'cluster-FOOBARBAZBATFF',
        DBClusterArn: 'arn:aws:rds:eu-central-1:555:cluster:fn-db-b-dev',
        AssociatedRoles: [],
        IAMDatabaseAuthenticationEnabled: false,
        ClusterCreateTime: '2019-12-03T09:55:26.380Z',
        EnabledCloudwatchLogsExports: [],
        EngineMode: 'provisioned',
        DeletionProtection: false,
        HttpEndpointEnabled: false,
        ActivityStreamStatus: 'stopped',
        CopyTagsToSnapshot: false,
        CrossAccountClone: false,
      },
    ],
  },
};
const mockDynamo = mockClient(DynamoDBClient);
const dynamoResponses = {
  deleteTable: {},
  describeTable: {},
};

const mockAas = mockClient(ApplicationAutoScalingClient);
const aasResponses = {
  describeScalableTargets: {
    ScalableTargets: [
      {
        ServiceNamespace: 'rds',
        ResourceId: 'cluster:fn-db-b-dev',
        ScalableDimension: 'rds:cluster:ReadReplicaCount',
        MinCapacity: 1,
        MaxCapacity: 15,
        RoleARN:
          'arn:aws:iam::555:role/aws-service-role/rds.application-autoscaling.amazonaws.com/AWSServiceRoleForApplicationAutoScaling_RDSCluster',
        CreationTime: '2019-12-03T09:56:17.243Z',
        SuspendedState: {
          DynamicScalingInSuspended: false,
          DynamicScalingOutSuspended: false,
          ScheduledScalingSuspended: false,
        },
      },
    ],
  },
  registerScalableTarget: {},
};

const mockSns = mockClient(SNSClient);
const snsResponses = {
  setSubscriptionAttributes: {},
};

const mockSqs = mockClient(SQSClient);
const sqsResponses = {
  purgeQueue: {},
};

const mockLambda = mockClient(LambdaClient);
const lambdaResponses = {
  updateEventSourceMapping: {},
  listEventSourceMappings: {
    NextMarker: null,
    EventSourceMappings: [
      {
        UUID: 'uuid',
        BatchSize: 10,
        MaximumBatchingWindowInSeconds: null,
        ParallelizationFactor: null,
        EventSourceArn: 'arn:aws:sqs:eu-central-1:555:fn-b-queue',
        FunctionArn: 'arn:aws:lambda:eu-central-1:555:function:fn-b',
        LastModified: new Date(),
        LastProcessingResult: null,
        State: 'Disabled',
        StateTransitionReason: 'USER_INITIATED',
        MaximumRecordAgeInSeconds: null,
        BisectBatchOnFunctionError: null,
        MaximumRetryAttempts: null,
      },
    ],
  },
  createEventSourceMapping: {
    UUID: 'e2fc5e11-79cc-47b1-bd80-fcd7a852b214',
    StartingPosition: 'TRIM_HORIZON',
    BatchSize: 100,
    MaximumBatchingWindowInSeconds: 0,
    ParallelizationFactor: 1,
    EventSourceArn:
      'arn:aws:kinesis:eu-central-1:123456789:stream/my-stream-dev',
    FunctionArn: 'arn:aws:lambda:eu-central-1:123456789:function:my-fn-dev',
    LastModified: '2020-12-09T11:26:31.934000+00:00',
    LastProcessingResult: 'No records processed',
    State: 'Creating',
    StateTransitionReason: 'User action',
    DestinationConfig: {
      OnFailure: {},
    },
    MaximumRecordAgeInSeconds: -1,
    BisectBatchOnFunctionError: false,
    MaximumRetryAttempts: -1,
  },
  deleteEventSourceMapping: {
    UUID: '091a66ea-1d4c-411c-97f0-039905401602',
    StartingPosition: 'TRIM_HORIZON',
    BatchSize: 100,
    MaximumBatchingWindowInSeconds: 0,
    ParallelizationFactor: 1,
    EventSourceArn:
      'arn:aws:kinesis:eu-central-1:123456789:stream/my-stream-dev',
    FunctionArn: 'arn:aws:lambda:eu-central-1:123456789:function:my-fn-dev',
    LastModified: '2020-12-08T17:32:00+00:00',
    LastProcessingResult: 'OK',
    State: 'Deleting',
    StateTransitionReason: 'User action',
    DestinationConfig: {
      OnFailure: {},
    },
    MaximumRecordAgeInSeconds: -1,
    BisectBatchOnFunctionError: false,
    MaximumRetryAttempts: -1,
  },
};

const mockEvents = mockClient(CloudWatchEventsClient);
export const eventsResponses = {
  listRuleNamesByTarget: {
    RuleNames: ['fn-dev-RefreshEventsRuleSchedule-1SI6FNZ1LC3NI'],
  },
};

const mockCloudwatch = mockClient(CloudWatchClient);
const cwResponses = {
  describeAlarms: {
    MetricAlarms: [
      {
        AlarmName: 'mock service - dev - lambda1 - B',
      },
      {
        AlarmName: 'mock service - dev - lambda2 - B',
      },
      {
        AlarmName: 'mock service - dev - lambda3 - B',
      },
      {
        AlarmName: 'mock service - dev - lambda1 - A',
      },
      {
        AlarmName: 'mock service - dev - lambda2 - A',
      },
      {
        AlarmName: 'mock service - dev - lambda3 - A',
      },
    ],
  },
  getMetricData: {
    MetricDataResults: [
      {
        Id: 'iteratorage',
        Label: 'IteratorAge',
        Timestamps: [
          new Date('2021-06-02T15:23:00.000Z'),
          new Date('2021-06-02T15:22:00.000Z'),
          new Date('2021-06-02T15:21:00.000Z'),
          new Date('2021-06-02T15:20:00.000Z'),
          new Date('2021-06-02T15:19:00.000Z'),
        ],
        Values: [5193039, 5121276, 5065201, 5010924, 4955845],
        StatusCode: 'Complete',
        Messages: [],
      },
      {
        Id: 'errors',
        Label: 'Errors',
        Timestamps: [
          new Date('2021-06-02T15:23:00.000Z'),
          new Date('2021-06-02T15:22:00.000Z'),
          new Date('2021-06-02T15:21:00.000Z'),
          new Date('2021-06-02T15:20:00.000Z'),
          new Date('2021-06-02T15:19:00.000Z'),
        ],
        Values: [4, 4, 4, 4, 4],
        StatusCode: 'Complete',
        Messages: [],
      },
      {
        Id: 'concurrentexecutions',
        Label: 'ConcurrentExecutions',
        Timestamps: [
          new Date('2021-06-02T15:23:00.000Z'),
          new Date('2021-06-02T15:22:00.000Z'),
          new Date('2021-06-02T15:21:00.000Z'),
          new Date('2021-06-02T15:20:00.000Z'),
          new Date('2021-06-02T15:19:00.000Z'),
        ],
        Values: [1, 1, 1, 1, 1],
        StatusCode: 'Complete',
        Messages: [],
      },
      {
        Id: 'invocations',
        Label: 'Invocations',
        Timestamps: [
          new Date('2021-06-02T15:23:00.000Z'),
          new Date('2021-06-02T15:22:00.000Z'),
          new Date('2021-06-02T15:21:00.000Z'),
          new Date('2021-06-02T15:20:00.000Z'),
          new Date('2021-06-02T15:19:00.000Z'),
        ],
        Values: [4, 4, 4, 4, 4],
        StatusCode: 'Complete',
        Messages: [],
      },
      {
        Id: 'duration',
        Label: 'Duration',
        Timestamps: [
          new Date('2021-06-02T15:23:00.000Z'),
          new Date('2021-06-02T15:22:00.000Z'),
          new Date('2021-06-02T15:21:00.000Z'),
          new Date('2021-06-02T15:20:00.000Z'),
          new Date('2021-06-02T15:19:00.000Z'),
        ],
        Values: [10.4375, 12.7475, 10.685, 10.4425, 11.1325],
        StatusCode: 'Complete',
        Messages: [],
      },
      {
        Id: 'throttles',
        Label: 'Throttles',
        Timestamps: [
          new Date('2021-06-02T15:23:00.000Z'),
          new Date('2021-06-02T15:22:00.000Z'),
          new Date('2021-06-02T15:21:00.000Z'),
          new Date('2021-06-02T15:20:00.000Z'),
          new Date('2021-06-02T15:19:00.000Z'),
        ],
        Values: [0, 0, 0, 0, 0],
        StatusCode: 'Complete',
        Messages: [],
      },
    ],
  },
};

const mockKinesis = mockClient(KinesisClient);
const kinesisResponses = {
  registerStreamConsumer: {
    Consumer: {
      ConsumerName: 'con1',
      ConsumerARN:
        'arn:aws:kinesis:eu-central-1:123456789:stream/my-stream-dev/consumer/con1:1607511009',
      ConsumerStatus: 'CREATING',
      ConsumerCreationTimestamp: '2020-12-09T10:50:09+00:00',
    },
  },
  deregisterStreamConsumer: {},
  describeStreamConsumer: {
    ConsumerDescription: {
      ConsumerName: 'con1',
      ConsumerARN:
        'arn:aws:kinesis:eu-central-1:123456789:stream/my-stream-dev/consumer/con1:1607511009',
      ConsumerStatus: 'ACTIVE',
      ConsumerCreationTimestamp: '2020-12-09T10:50:09+00:00',
      StreamARN: 'arn:aws:kinesis:eu-central-1:123456789:stream/my-stream-dev',
    },
  },
};

export const awsMocks = {
  mockAas,
  mockRds,
  mockDynamo,
  mockSns,
  mockSqs,
  mockLambda,
  mockEvents,
  mockCloudwatch,
  mockKinesis,
};

export function resetMocks() {
  awsMocks.mockSns.reset();
  awsMocks.mockSns
    .on(SetSubscriptionAttributesCommand)
    .resolves(snsResponses.setSubscriptionAttributes);
  awsMocks.mockKinesis.reset();
  awsMocks.mockKinesis
    .on(RegisterStreamConsumerCommand)
    .resolves(kinesisResponses.registerStreamConsumer);
  awsMocks.mockKinesis
    .on(DeregisterStreamConsumerCommand)
    .resolves(kinesisResponses.deregisterStreamConsumer);
  awsMocks.mockKinesis
    .on(DescribeStreamConsumerCommand)
    .resolves(kinesisResponses.describeStreamConsumer);
  awsMocks.mockCloudwatch.reset();
  awsMocks.mockCloudwatch
    .on(DescribeAlarmsCommand)
    .resolves(cwResponses.describeAlarms);
  awsMocks.mockCloudwatch
    .on(GetMetricDataCommand)
    .resolves(cwResponses.getMetricData);
  awsMocks.mockEvents.reset();
  awsMocks.mockEvents
    .on(ListRuleNamesByTargetCommand)
    .resolves(eventsResponses.listRuleNamesByTarget);
  awsMocks.mockLambda.reset();
  awsMocks.mockLambda
    .on(UpdateEventSourceMappingCommand)
    .resolves(lambdaResponses.updateEventSourceMapping);
  awsMocks.mockLambda
    .on(ListEventSourceMappingsCommand)
    .resolves(lambdaResponses.listEventSourceMappings);
  awsMocks.mockLambda
    .on(CreateEventSourceMappingCommand)
    .resolves(lambdaResponses.createEventSourceMapping);
  awsMocks.mockLambda
    .on(DeleteEventSourceMappingCommand)
    .resolves(lambdaResponses.deleteEventSourceMapping);
  awsMocks.mockLambda.on(PurgeQueueCommand).resolves(sqsResponses.purgeQueue);
  awsMocks.mockSqs.reset();
  awsMocks.mockSqs.on(PurgeQueueCommand).resolves(sqsResponses.purgeQueue);
  awsMocks.mockDynamo.reset();
  awsMocks.mockDynamo
    .on(DeleteTableCommand)
    .resolves(dynamoResponses.deleteTable);
  awsMocks.mockDynamo.on(DescribeTableCommand).callsFake(async () => {
    const e = new Error();
    e.name = 'ResourceNotFoundException';
    throw e;
  });
  awsMocks.mockRds.reset();
  awsMocks.mockRds
    .on(DescribeDBClustersCommand)
    .resolves(rdsResponses.describeDBClusters);
  awsMocks.mockRds
    .on(DescribeDBInstancesCommand)
    .resolves(rdsResponses.describeDBInstances);
  awsMocks.mockRds.on(ModifyDBInstanceCommand).resolves();
  awsMocks.mockAas.reset();
  awsMocks.mockAas
    .on(RegisterScalableTargetCommand)
    .resolves(aasResponses.registerScalableTarget);
  awsMocks.mockAas
    .on(DescribeScalableTargetsCommand)
    .resolves(aasResponses.describeScalableTargets);
}
