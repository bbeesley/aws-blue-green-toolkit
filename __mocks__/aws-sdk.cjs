const _rdsResponses = {
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

const _rdsConstructor = jest.fn();
const _describeDBClusters = jest.fn(
  async () => _rdsResponses.describeDBClusters
);

class RDS {
  constructor(params) {
    _rdsConstructor(params);
  }

  describeDBClusters(params) {
    return { promise: _describeDBClusters.bind(this, params) };
  }
}

RDS._rdsConstructor = _rdsConstructor;
RDS._describeDBClusters = _describeDBClusters;
RDS._rdsResponses = _rdsResponses;

const _dynamoResponses = {
  deleteTable: {},
  waitFor: {},
};
const _dynamoConstructor = jest.fn();
const _deleteTable = jest.fn(async () => _dynamoResponses.deleteTable);
const _waitFor = jest.fn(async () => _dynamoResponses.waitFor);

class DynamoDB {
  constructor(params) {
    _dynamoConstructor(params);
  }

  deleteTable(params) {
    return { promise: _deleteTable.bind(this, params) };
  }

  waitFor(state, params) {
    return { promise: _waitFor.bind(this, state, params) };
  }
}

DynamoDB._dynamoConstructor = _dynamoConstructor;
DynamoDB._deleteTable = _deleteTable;
DynamoDB._waitFor = _waitFor;
DynamoDB._dynamoResponses = _dynamoResponses;

const _aasResponses = {
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
const _aasConstructor = jest.fn();
const _describeScalableTargets = jest.fn(
  async () => _aasResponses.describeScalableTargets
);
const _registerScalableTarget = jest.fn(
  async () => _aasResponses.registerScalableTarget
);

class ApplicationAutoScaling {
  constructor(params) {
    _aasConstructor(params);
  }

  describeScalableTargets(params) {
    return { promise: _describeScalableTargets.bind(this, params) };
  }

  registerScalableTarget(params) {
    return { promise: _registerScalableTarget.bind(this, params) };
  }
}

ApplicationAutoScaling._aasConstructor = _aasConstructor;
ApplicationAutoScaling._describeScalableTargets = _describeScalableTargets;
ApplicationAutoScaling._registerScalableTarget = _registerScalableTarget;
ApplicationAutoScaling._aasResponses = _aasResponses;

const _snsResponses = {
  setSubscriptionAttributes: {},
};
const _snsConstructor = jest.fn();
const _setSubscriptionAttributes = jest.fn(
  async () => _snsResponses.setSubscriptionAttributes
);

class SNS {
  constructor(params) {
    _snsConstructor(params);
  }

  setSubscriptionAttributes(params) {
    return { promise: _setSubscriptionAttributes.bind(this, params) };
  }
}

SNS._snsConstructor = _snsConstructor;
SNS._setSubscriptionAttributes = _setSubscriptionAttributes;
SNS._snsResponses = _snsResponses;
const _sqsResponses = {
  purgeQueue: {},
};
const _sqsConstructor = jest.fn();
const _purgeQueue = jest.fn(async () => _sqsResponses.purgeQueue);

class SQS {
  constructor(params) {
    _sqsConstructor(params);
  }

  purgeQueue(params) {
    return { promise: _purgeQueue.bind(this, params) };
  }
}

SQS._sqsConstructor = _sqsConstructor;
SQS._purgeQueue = _purgeQueue;
SQS._sqsResponses = _sqsResponses;
const _lambdaResponses = {
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

const _lambdaConstructor = jest.fn();
const _listEventSourceMappings = jest.fn(
  async () => _lambdaResponses.listEventSourceMappings
);
const _updateEventSourceMapping = jest.fn(
  async () => _lambdaResponses.updateEventSourceMapping
);
const _createEventSourceMapping = jest.fn(
  async () => _lambdaResponses.createEventSourceMapping
);
const _deleteEventSourceMapping = jest.fn(
  async () => _lambdaResponses.deleteEventSourceMapping
);

class Lambda {
  constructor(params) {
    _lambdaConstructor(params);
  }

  listEventSourceMappings(params) {
    return { promise: _listEventSourceMappings.bind(this, params) };
  }

  updateEventSourceMapping(params) {
    return { promise: _updateEventSourceMapping.bind(this, params) };
  }

  createEventSourceMapping(params) {
    return { promise: _createEventSourceMapping.bind(this, params) };
  }

  deleteEventSourceMapping(params) {
    return { promise: _deleteEventSourceMapping.bind(this, params) };
  }
}

Lambda._lambdaConstructor = _lambdaConstructor;
Lambda._listEventSourceMappings = _listEventSourceMappings;
Lambda._updateEventSourceMapping = _updateEventSourceMapping;
Lambda._createEventSourceMapping = _createEventSourceMapping;
Lambda._deleteEventSourceMapping = _deleteEventSourceMapping;
Lambda._lambdaResponses = _lambdaResponses;

const _eventsConstructor = jest.fn();
const _eventsResponses = {
  listRuleNamesByTarget: {
    RuleNames: ['fn-dev-RefreshEventsRuleSchedule-1SI6FNZ1LC3NI'],
  },
};
const _enableRule = jest.fn(async () => _eventsResponses.enableRule);
const _disableRule = jest.fn(async () => _eventsResponses.disableRule);
const _listRuleNamesByTarget = jest.fn(
  async () => _eventsResponses.listRuleNamesByTarget
);

class CloudWatchEvents {
  constructor(params) {
    _eventsConstructor(params);
  }

  enableRule(params) {
    return { promise: _enableRule.bind(this, params) };
  }

  disableRule(params) {
    return { promise: _disableRule.bind(this, params) };
  }

  listRuleNamesByTarget(params) {
    return { promise: _listRuleNamesByTarget.bind(this, params) };
  }
}

CloudWatchEvents._eventsResponses = _eventsResponses;
CloudWatchEvents._enableRule = _enableRule;
CloudWatchEvents._disableRule = _disableRule;
CloudWatchEvents._listRuleNamesByTarget = _listRuleNamesByTarget;

const _cwConstructor = jest.fn();
const _cwResponses = {
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
const _enableAlarmActions = jest.fn();
const _disableAlarmActions = jest.fn();
const _describeAlarms = jest.fn(async () => _cwResponses.describeAlarms);
const _getMetricData = jest.fn(async () => _cwResponses.getMetricData);

class CloudWatch {
  constructor(params) {
    _cwConstructor(params);
  }

  describeAlarms(params) {
    return { promise: _describeAlarms.bind(this, params) };
  }

  disableAlarmActions(params) {
    return { promise: _disableAlarmActions.bind(this, params) };
  }

  enableAlarmActions(params) {
    return { promise: _enableAlarmActions.bind(this, params) };
  }

  getMetricData(params) {
    return { promise: _getMetricData.bind(this, params) };
  }
}
CloudWatch._cwResponses = _cwResponses;
CloudWatch._enableAlarmActions = _enableAlarmActions;
CloudWatch._disableAlarmActions = _disableAlarmActions;
CloudWatch._describeAlarms = _describeAlarms;
CloudWatch._getMetricData = _getMetricData;

const _kinesisResponses = {
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
const _kinesisConstructor = jest.fn();
const _registerStreamConsumer = jest.fn(
  async () => _kinesisResponses.registerStreamConsumer
);
const _deregisterStreamConsumer = jest.fn(
  async () => _kinesisResponses.deregisterStreamConsumer
);
const _describeStreamConsumer = jest.fn(
  async () => _kinesisResponses.describeStreamConsumer
);

class Kinesis {
  constructor(params) {
    _kinesisConstructor(params);
  }

  registerStreamConsumer(params) {
    return { promise: _registerStreamConsumer.bind(this, params) };
  }

  deregisterStreamConsumer(params) {
    return { promise: _deregisterStreamConsumer.bind(this, params) };
  }

  describeStreamConsumer(params) {
    return { promise: _describeStreamConsumer.bind(this, params) };
  }
}

Kinesis._kinesisConstructor = _kinesisConstructor;
Kinesis._registerStreamConsumer = _registerStreamConsumer;
Kinesis._deregisterStreamConsumer = _deregisterStreamConsumer;
Kinesis._describeStreamConsumer = _describeStreamConsumer;
Kinesis._kinesisResponses = _kinesisResponses;

module.exports = {
  ApplicationAutoScaling,
  CloudWatchEvents,
  CloudWatch,
  DynamoDB,
  Kinesis,
  Lambda,
  RDS,
  SNS,
  SQS,
};
