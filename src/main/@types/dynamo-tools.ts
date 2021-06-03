import { AwsConfig } from './common';

/**
 * Configuration options for the Aurora toolkit
 * @export
 * @interface DynamoConfig
 * @extends {AwsConfig}
 */
export interface DynamoConfig extends AwsConfig {
  tableNameA: string;
  tableNameB: string;
  waitForTableDelete?: boolean;
}
