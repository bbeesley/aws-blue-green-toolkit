import type { AwsConfig } from './common.js';

/**
 * Configuration options for the Aurora toolkit
 *
 * @export
 * @interface AuroraConfig
 * @extends {AwsConfig}
 */
export interface AuroraConfig extends AwsConfig {
  clusterNameA: string;
  clusterNameB: string;
  minimumClusterSize: number;
  skipDeleteSnapshots: boolean;
  namespace: string;
}
