import type { AwsConfig } from './common.js';

/**
 * Configuration options for the ECS toolkit
 *
 * @export
 * @interface EcsConfig
 * @extends {AwsConfig}
 */
export interface EcsConfig extends AwsConfig {
  serviceNameA: string;
  serviceNameB: string;
  desiredTasks: number;
}
