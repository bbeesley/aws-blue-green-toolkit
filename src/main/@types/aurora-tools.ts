import type { AwsConfig } from './common.js';

/**
 * Configuration options for the Aurora toolkit
 *
 * @export
 * @interface AuroraConfig
 * @extends {AwsConfig}
 */
export type AuroraConfig = {
  /**
   * The name of a cluster
   *
   * @type {string}
   */
  clusterNameA: string;
  /**
   * The name of a secondary cluster (just set to an empty string if not using cluster pairs)
   *
   * @type {string}
   */
  clusterNameB: string;
  /**
   * The minimum size, below which the cluster should not scale in
   *
   * @type {number}
   */
  minimumClusterSize: number;
  /**
   * Whether or not we should skip delete snapshots
   *
   * @type {boolean}
   */
  skipDeleteSnapshots: boolean;
  /**
   * Common namespace for the clusters. Use '*' to ignore filtering operations by namespace
   *
   * @type {string}
   */
  namespace: string;
} & AwsConfig;
