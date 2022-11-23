import type { AwsConfig } from './common.js';

/**
 * Configuration options for the Aurora toolkit
 *
 * @export
 * @interface KinesisConfig
 * @extends {AwsConfig}
 */
export type KinesisConfig = {
  streamArn: string;
  consumerNameA: string;
  consumerNameB: string;
} & AwsConfig;
