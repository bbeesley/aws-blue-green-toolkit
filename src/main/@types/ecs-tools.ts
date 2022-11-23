import type { AwsConfig } from './common.js';

/**
 * Configuration options for the ECS toolkit
 *
 * @export
 * @interface EcsConfig
 * @extends {AwsConfig}
 */
export type EcsConfig = {
  serviceNameA: string;
  serviceNameB: string;
  cluster: string;
  desiredTasks: number;
} & AwsConfig;
