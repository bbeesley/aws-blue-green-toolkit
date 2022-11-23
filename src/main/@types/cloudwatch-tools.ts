import type { AwsConfig } from './common.js';

/**
 * Configuration options for the CloudWatch toolkit
 *
 * @export
 * @interface CloudWatchConfig
 * @extends {AwsConfig}
 */
export type CloudWatchConfig = {
  alarmStackA: AlarmIdentifiers;
  alarmStackB: AlarmIdentifiers;
} & AwsConfig;

export type AlarmIdentifiers = {
  alarmPrefix: string;
  alarmSuffix?: string;
};
