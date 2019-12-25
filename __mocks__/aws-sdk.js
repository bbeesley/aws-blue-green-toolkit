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

module.exports = {
  ApplicationAutoScaling,
  RDS,
  SNS,
  SQS,
};
