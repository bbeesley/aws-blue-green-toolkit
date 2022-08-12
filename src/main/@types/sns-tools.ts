import type { AwsConfig } from './common.js';

/**
 * Configuration options for the SNS toolkit
 * @export
 * @interface SnsConfig
 * @extends {AwsConfig}
 */
export interface SnsConfig extends AwsConfig {
  topicA: TopicData;
  topicB: TopicData;
}

/**
 * Parameters to describe an SNS topic subscription
 * @export
 * @interface TopicData
 */
export interface TopicData {
  name: string;
  region: string;
  subscriptionArn: string;
  enabledFilter?: Record<string, any>;
  disabledFilter?: Record<string, any>;
}
