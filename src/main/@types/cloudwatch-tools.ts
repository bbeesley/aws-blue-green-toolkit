import { AwsConfig } from './common';

/**
 * Configuration options for the CloudWatch toolkit
 * @export
 * @interface CloudWatchConfig
 * @extends {AwsConfig}
 */
export interface CloudWatchConfig extends AwsConfig {
  alarmStackA: AlarmIdentifiers;
  alarmStackB: AlarmIdentifiers;
}

export interface AlarmIdentifiers {
  alarmPrefix: string;
  alarmSuffix?: string;
}
