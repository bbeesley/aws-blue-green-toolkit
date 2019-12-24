import { RDS, ApplicationAutoScaling } from 'aws-sdk';
import { SNSEventRecord } from 'aws-lambda';
import { AwsConfig } from './common-interfaces';
import { DatabaseReference, ClusterState } from './constants';

/**
 * Configuration options for the Aurora toolkit
 * @interface AuroraConfig
 * @extends {AwsConfig}
 */
interface AuroraConfig extends AwsConfig {
  clusterNameA: string;
  clusterNameB: string;
  minimumClusterSize: number;
  skipDeleteSnapshots: boolean;
}

/**
 * Toolkit for Aurora operations
 * @export
 * @class AuroraTools
 */
export class AuroraTools {
  config: AuroraConfig;
  rds: RDS;
  aas: ApplicationAutoScaling;

  /**
   *Creates an instance of AuroraTools.
   * @param {AuroraConfig} config - Configuration options for the Aurora toolkit
   * @memberof AuroraTools
   */
  public constructor(config: AuroraConfig) {
    this.config = config;
    this.rds = new RDS({ region: this.config.awsRegion });
    this.aas = new ApplicationAutoScaling({ region: this.config.awsRegion });
  }

  /**
   * Returns the cluster name associated with a database reference
   * @protected
   * @param {DatabaseReference} ref - Reference to a db cluster
   * @returns {string} - The name of the db cluster
   * @memberof AuroraTools
   */
  protected getClusterName(ref: DatabaseReference): string {
    return ref === DatabaseReference.a
      ? this.config.clusterNameA
      : this.config.clusterNameB;
  }

  /**
   * Returns the cluster name of a cluster's partner cluster
   * @protected
   * @param {DatabaseReference} ref - Reference to a db cluster
   * @returns {string} - The name of the partner cluster
   * @memberof AuroraTools
   */
  protected getClusterPartnerName(ref: DatabaseReference): string {
    return ref === DatabaseReference.b
      ? this.config.clusterNameA
      : this.config.clusterNameB;
  }

  /**
   * Returns a partner reference, given a reference
   * @protected
   * @param {DatabaseReference} ref - Reference to a db cluster
   * @returns {DatabaseReference} - The reference to the partner
   * @memberof AuroraTools
   */
  protected getClusterPartnerRef(ref: DatabaseReference): DatabaseReference {
    return ref === DatabaseReference.a
      ? DatabaseReference.b
      : DatabaseReference.a;
  }

  /**
   * Gets the current state of one of the Aurora clusters
   * @param {DatabaseReference} reference - Reference to a db cluster
   * @returns {Promise<ClusterState>}
   * @memberof AuroraTools
   */
  public async getClusterState(
    reference: DatabaseReference
  ): Promise<ClusterState> {
    const DBClusterIdentifier = this.getClusterName(reference);
    const { DBClusters } = await this.rds
      .describeDBClusters({ DBClusterIdentifier })
      .promise();
    if (DBClusters && DBClusters.length === 1) {
      const { Status } = DBClusters[0];
      if (Status) {
        if (Status === ClusterState.AVAILABLE) return ClusterState.AVAILABLE;
        if (Status === ClusterState.STOPPED) return ClusterState.STOPPED;
        if (Status === ClusterState.STARTING) return ClusterState.STARTING;
        if (Status === ClusterState.STOPPING) return ClusterState.STOPPING;
      }
    }
    console.error(`unable to get cluster info for ${DBClusterIdentifier}`);
    throw new Error(`unable to get cluster info for ${DBClusterIdentifier}`);
  }

  /**
   * Scale a database cluster to a given minimum capacity
   * @protected
   * @param {DatabaseReference} reference - Reference to a db cluster
   * @param {number} minCapacity - The desired minimum capacity to set
   * @returns {Promise<ApplicationAutoScaling.RegisterScalableTargetResponse>}
   * @memberof AuroraTools
   */
  protected async scale(
    reference: DatabaseReference,
    minCapacity: number
  ): Promise<ApplicationAutoScaling.RegisterScalableTargetResponse> {
    const db = this.getClusterName(reference);
    const aasResponse = await this.aas
      .describeScalableTargets({
        ServiceNamespace: 'rds',
        ResourceIds: [`cluster:${db}`],
      })
      .promise();
    if (
      aasResponse &&
      aasResponse.ScalableTargets &&
      aasResponse.ScalableTargets[0]
    ) {
      const scalingTarget = aasResponse.ScalableTargets[0];
      const { ServiceNamespace, ResourceId, ScalableDimension } = scalingTarget;
      console.log(
        `setting minimum capacity of ${ResourceId} cluster to ${minCapacity}`
      );
      return await this.aas
        .registerScalableTarget({
          ResourceId,
          ScalableDimension,
          ServiceNamespace,
          MinCapacity: minCapacity,
        })
        .promise();
    }
    throw new Error(`unable to scale out db cluster ${db}`);
  }

  /**
   * Reverts a cluster's minimum reader count to the configured minimum
   * @param {DatabaseReference} reference - Reference to a db cluster
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async scaleIn(reference: DatabaseReference): Promise<void> {
    await this.scale(reference, this.config.minimumClusterSize);
  }

  /**
   * Scales out a cluster to match it's partner's size
   * @param {DatabaseReference} reference - Reference to a db cluster
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async scaleOut(reference: DatabaseReference): Promise<void> {
    const desiredSize = await this.getReaderCount(
      this.getClusterPartnerRef(reference)
    );
    await this.scale(reference, desiredSize);
  }

  /**
   * Get a count of the number of active readers for a cluster
   * @param {DatabaseReference} reference - Reference to a db cluster
   * @returns {Promise<number>} - The number of active readers
   * @memberof AuroraTools
   */
  public async getReaderCount(reference: DatabaseReference): Promise<number> {
    const DBClusterIdentifier = this.getClusterName(reference);
    const clusterDescription = await this.rds
      .describeDBClusters({ DBClusterIdentifier })
      .promise();
    if (
      clusterDescription &&
      clusterDescription.DBClusters &&
      clusterDescription.DBClusters[0] &&
      clusterDescription.DBClusters[0].DBClusterMembers
    ) {
      return clusterDescription.DBClusters[0].DBClusterMembers.length - 1;
    }
    throw new Error('unable to count active db readers');
  }

  /**
   * Starts a stopped db cluster
   * @param {DatabaseReference} reference - Reference to a db cluster
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async startDatabase(reference: DatabaseReference): Promise<void> {
    const DBClusterIdentifier = this.getClusterName(reference);
    await this.rds.startDBCluster({ DBClusterIdentifier }).promise();
  }

  /**
   * Stops a running db cluster
   * @param {DatabaseReference} reference - Reference to a db cluster
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async stopDatabase(reference: DatabaseReference): Promise<void> {
    const DBClusterIdentifier = this.getClusterName(reference);
    await this.rds.stopDBCluster({ DBClusterIdentifier }).promise();
  }

  /**
   * Deletes a running db cluster
   * @param {DatabaseReference} reference - Reference to a db cluster
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async deleteDatabase(reference: DatabaseReference): Promise<void> {
    const DBClusterIdentifier = this.getClusterName(reference);
    const { DBClusters } = await this.rds
      .describeDBClusters({ DBClusterIdentifier })
      .promise();
    if (DBClusters && DBClusters.length === 1) {
      const { DBClusterMembers } = DBClusters[0];
      if (DBClusterMembers && DBClusterMembers.length > 0) {
        await Promise.all(
          DBClusterMembers.map(async ({ DBInstanceIdentifier }) => {
            if (DBInstanceIdentifier) {
              await this.rds
                .deleteDBInstance({
                  DBInstanceIdentifier,
                  SkipFinalSnapshot: true,
                })
                .promise();
            }
          })
        );
        await this.rds
          .deleteDBCluster({
            DBClusterIdentifier,
            SkipFinalSnapshot: this.config.skipDeleteSnapshots,
          })
          .promise();
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
   * @param {SNSEventRecord} record - An SNS event record of the type published by rds event streams
   * @returns {Promise<void>}
   * @memberof AuroraTools
   */
  public async applyTags(record: SNSEventRecord): Promise<void> {
    const message = JSON.parse(record.Sns.Message);
    if (message['Event Message'] === 'DB instance created') {
      const Tags = Object.entries(this.config.tags).map(([Key, Value]) => ({
        Key,
        Value,
      }));
      Tags.push({ Key: 'Role', Value: 'Reader' });
      const ResourceName = `arn:aws:rds:${this.config.awsRegion}:${this.config.awsProfile}:db:${message['Source ID']}`;
      const details = await this.rds
        .listTagsForResource({
          ResourceName,
        })
        .promise();
      const scalingResourceTag = details.TagList
        ? details.TagList.find(
            t =>
              t.Key === 'application-autoscaling:resourceId' &&
              t.Value &&
              t.Value.includes(this.config.namespace)
          )
        : undefined;
      if (scalingResourceTag) {
        await this.rds
          .addTagsToResource({
            ResourceName,
            Tags,
          })
          .promise();
      }
    }
  }
}
