import type { AwsConfig } from './common.js';

/**
 * Configuration options for the Aurora toolkit
 *
 * @export
 * @interface AuroraConfig
 * @extends {AwsConfig}
 */
export type AuroraConfig = {
  clusterNameA: string;
  clusterNameB: string;
  minimumClusterSize: number;
  skipDeleteSnapshots: boolean;
  namespace: string;
} & AwsConfig;
