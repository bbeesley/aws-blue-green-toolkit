import {
  ApplicationAutoScalingClient,
  DescribeScalableTargetsCommand,
  RegisterScalableTargetCommand,
  type RegisterScalableTargetResponse,
} from '@aws-sdk/client-application-auto-scaling';
import {
  AddTagsToResourceCommand,
  DeleteDBClusterCommand,
  DeleteDBInstanceCommand,
  DescribeDBInstancesCommand,
  DescribeDBClustersCommand,
  ListTagsForResourceCommand,
  RDSClient,
  StartDBClusterCommand,
  StopDBClusterCommand,
  ModifyDBInstanceCommand,
  RDSServiceException,
  type Tag,
} from '@aws-sdk/client-rds';
import type { SNSEventRecord } from 'aws-lambda';
import delay from 'delay';
import type { AuroraConfig } from './@types/index.js';
import { ClusterState, StackReference } from './constants.js';

/**
 * Toolkit for Aurora operations
 *
 * @export
 * @class AuroraTools
 */
export class AuroraTools {
  rds: RDSClient;

  aas: ApplicationAutoScalingClient;

  /**
   * Creates an instance of AuroraTools.
   *
   * @param {AuroraConfig} config - Configuration options for the Aurora toolkit
   * @memberof AuroraTools
   */
  public constructor(public config: AuroraConfig) {
    this.config = config;
    this.rds = new RDSClient({ region: this.config.awsRegion });
    this.aas = new ApplicationAutoScalingClient({
      region: this.config.awsRegion,
    });
  }

  /**
   * Gets the current state of one of the Aurora clusters
   *
   * @param {StackReference} reference - Reference to a db cluster
   * @returns {Promise<ClusterState>}
   * @memberof AuroraTools
   */
  public async getClusterState(
    reference: StackReference
  ): Promise<ClusterState> {
    const DBClusterIdentifier = this.getClusterName(reference);
    const { DBClusters } = await this.rds.send(
      new DescribeDBClustersCommand({ DBClusterIdentifier })
    );
    if (DBClusters && DBClusters.length === 1) {
      const { Status } = DBClusters[0] ?? {};
      if (Status) {
        if (Status === ClusterState.AVAILABLE) return ClusterState.AVAILABLE;
        if (Status === ClusterState.STOPPED) return ClusterState.STOPPED;
        if (Status === ClusterState.STARTING) return ClusterState.STARTING;
        if (Status === ClusterState.STOPPING) return ClusterState.STOPPING;
      }
    }

    throw new Error(`unable to get cluster info for ${DBClusterIdentifier}`);
  }

  /**
   * Reverts a cluster's minimum reader count to the configured minimum
   *
   * @param {StackReference} reference - Reference to a db cluster
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async scaleIn(reference: StackReference): Promise<void> {
    await this.scale(reference, this.config.minimumClusterSize);
  }

  /**
   * Scales out a cluster to match it's partner's size
   *
   * @param {StackReference} reference - Reference to a db cluster
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async scaleOut(reference: StackReference): Promise<void> {
    const desiredSize = await this.getReaderCount(
      this.getClusterPartnerRef(reference)
    );
    await this.scale(reference, desiredSize);
  }

  /**
   * Get a count of the number of active readers for a cluster
   *
   * @param {StackReference} reference - Reference to a db cluster
   * @returns {Promise<number>} - The number of active readers
   * @memberof AuroraTools
   */
  public async getReaderCount(reference: StackReference): Promise<number> {
    const DBClusterIdentifier = this.getClusterName(reference);
    const clusterDescription = await this.rds.send(
      new DescribeDBClustersCommand({ DBClusterIdentifier })
    );
    if (clusterDescription?.DBClusters?.[0]?.DBClusterMembers) {
      return clusterDescription.DBClusters[0].DBClusterMembers.length - 1;
    }

    throw new Error('unable to count active db readers');
  }

  /**
   * Starts a stopped db cluster
   *
   * @param {StackReference} reference - Reference to a db cluster
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async startDatabase(reference: StackReference): Promise<void> {
    const DBClusterIdentifier = this.getClusterName(reference);
    await this.rds.send(new StartDBClusterCommand({ DBClusterIdentifier }));
  }

  /**
   * Stops a running db cluster
   *
   * @param {StackReference} reference - Reference to a db cluster
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async stopDatabase(reference: StackReference): Promise<void> {
    const DBClusterIdentifier = this.getClusterName(reference);
    await this.rds.send(new StopDBClusterCommand({ DBClusterIdentifier }));
  }

  /**
   * Deletes a running db cluster
   *
   * @param {StackReference} reference - Reference to a db cluster
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async deleteDatabase(reference: StackReference): Promise<void> {
    const DBClusterIdentifier = this.getClusterName(reference);
    const { DBClusters } = await this.rds.send(
      new DescribeDBClustersCommand({ DBClusterIdentifier })
    );
    if (DBClusters && DBClusters.length === 1) {
      const { DBClusterMembers } = DBClusters[0] ?? {};
      if (DBClusterMembers && DBClusterMembers.length > 0) {
        await Promise.all(
          DBClusterMembers.map(async ({ DBInstanceIdentifier }) => {
            if (DBInstanceIdentifier) {
              await this.rds.send(
                new DeleteDBInstanceCommand({
                  DBInstanceIdentifier,
                  SkipFinalSnapshot: true,
                })
              );
            }
          })
        );
        await this.rds.send(
          new DeleteDBClusterCommand({
            DBClusterIdentifier,
            SkipFinalSnapshot: this.config.skipDeleteSnapshots,
          })
        );
      } else {
        throw new Error(`cluster ${DBClusterIdentifier} has no members`);
      }
    } else {
      throw new Error(`unable to get cluster info for ${DBClusterIdentifier}`);
    }
  }

  /**
   * Parses a message from an rds event subscription, if the event was triggered by a scale out
   * operation, the tags defined in config are applied to the newly created reader.
   *
   * @param {SNSEventRecord} record - An SNS event record of the type published by rds event streams
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async applyTags(record: SNSEventRecord): Promise<void> {
    const message = JSON.parse(record.Sns.Message) as Record<string, string>;
    if (
      message['Event Message'] === 'DB instance created' &&
      message['Source ID']
    ) {
      const ResourceName = `arn:aws:rds:${this.config.awsRegion}:${this.config.awsProfile}:db:${message['Source ID']}`;
      const details = await this.rds.send(
        new ListTagsForResourceCommand({
          ResourceName,
        })
      );
      const scalingResourceTag = details.TagList
        ? details.TagList.find(
            (t) =>
              t.Key === 'application-autoscaling:resourceId' &&
              t.Value &&
              (t.Value.includes(this.config.namespace) ||
                this.config.namespace === '*')
          )
        : undefined;
      if (scalingResourceTag) {
        const Tags = Object.entries(this.config.tags).map(([Key, Value]) => ({
          Key,
          Value,
        }));
        if (Tags.length === 0) {
          const clusterTags = await this.getTagsForCluster(ResourceName);
          Tags.push(...clusterTags);
        }

        Tags.push({ Key: 'Role', Value: 'Reader' });
        await this.rds.send(
          new AddTagsToResourceCommand({
            ResourceName,
            Tags,
          })
        );
      }
    }
  }

  /**
   * Parses a message from an rds event subscription, if the event was triggered by a scale out
   * operation and the new instance does not have performance insights enabled, the instance is updated
   * to enable performance insights.
   *
   * @param {SNSEventRecord} record - An SNS event record of the type published by rds event streams
   * @param {boolean} [reEnableIfDisabled=true] - Whether or not to automatically re enable insights if they are disabled
   * @param {number} [retryDelay=60e3] - Time in ms to wait before retrying
   * @param {number} [retryAttempts=5] - Number of retry attempts
   * @returns {*}  {Promise<void>}
   * @memberof AuroraTools
   */
  public async enablePerformanceInsights(
    record: SNSEventRecord,
    reEnableIfDisabled = true,
    retryDelay = 60e3,
    retryAttempts = 5
  ): Promise<void> {
    const message = JSON.parse(record.Sns.Message) as Record<string, string>;
    if (
      (message['Event Message'] === 'DB instance created' ||
        (reEnableIfDisabled &&
          message['Event Message'] ===
            'Performance Insights has been disabled')) &&
      message['Source ID']
    ) {
      const DBInstanceIdentifier = message['Source ID'];
      const { DBInstances } = await this.rds.send(
        new DescribeDBInstancesCommand({
          DBInstanceIdentifier,
        })
      );
      if (DBInstances) {
        const description =
          DBInstances.find(
            (i) => i.DBInstanceIdentifier === DBInstanceIdentifier
          ) ?? {};
        const { PerformanceInsightsEnabled } = description;
        if (description && !PerformanceInsightsEnabled) {
          let complete = false;
          let attempts = 0;
          while (!complete && attempts < retryAttempts) {
            try {
              await this.rds.send(
                new ModifyDBInstanceCommand({
                  DBInstanceIdentifier,
                  EnablePerformanceInsights: true,
                })
              );
              complete = true;
            } catch (error) {
              console.error(error);
              if (
                error instanceof RDSServiceException &&
                (error as any).Code === 'InvalidDBInstanceState'
              ) {
                attempts += 1;
                await delay(retryDelay);
              } else {
                throw error;
              }
            }
          }
        }
      }
    }
  }

  protected async getTagsForCluster(
    dBInstanceIdentifier: string
  ): Promise<Array<Required<Tag>>> {
    const { DBInstances = [] } = await this.rds.send(
      new DescribeDBInstancesCommand({
        DBInstanceIdentifier: dBInstanceIdentifier,
      })
    );
    const [instance] = DBInstances;
    if (!instance) return [];
    const { DBClusterIdentifier } = instance;
    if (!DBClusterIdentifier) return [];
    const { DBClusters = [] } = await this.rds.send(
      new DescribeDBClustersCommand({
        DBClusterIdentifier,
      })
    );
    const [cluster] = DBClusters;
    return cluster?.TagList?.filter(this.isCompleteTag) ?? [];
  }

  protected async scale(
    reference: StackReference,
    minCapacity: number
  ): Promise<RegisterScalableTargetResponse> {
    const db = this.getClusterName(reference);
    const aasResponse = await this.aas.send(
      new DescribeScalableTargetsCommand({
        ServiceNamespace: 'rds',
        ResourceIds: [`cluster:${db}`],
      })
    );
    if (aasResponse?.ScalableTargets?.[0]) {
      const scalingTarget = aasResponse.ScalableTargets[0];
      const { ServiceNamespace, ResourceId, ScalableDimension } = scalingTarget;
      const response = await this.aas.send(
        new RegisterScalableTargetCommand({
          ResourceId,
          ScalableDimension,
          ServiceNamespace,
          MinCapacity: minCapacity,
        })
      );
      return response;
    }

    throw new Error(`unable to scale out db cluster ${db}`);
  }

  protected getClusterName(ref: StackReference): string {
    return ref === StackReference.a
      ? this.config.clusterNameA
      : this.config.clusterNameB;
  }

  protected getClusterPartnerName(ref: StackReference): string {
    return ref === StackReference.b
      ? this.config.clusterNameA
      : this.config.clusterNameB;
  }

  protected getClusterPartnerRef(ref: StackReference): StackReference {
    return ref === StackReference.a ? StackReference.b : StackReference.a;
  }

  private isCompleteTag(
    tag: Tag,
    _ix: number,
    _array: Tag[]
  ): tag is Required<Tag> {
    return Boolean(tag.Key && tag.Value);
  }
}
