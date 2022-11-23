import type { AwsConfig } from './common.js';

/**
 * Configuration options for the SNS toolkit
 *
 * @export
 * @interface SnsConfig
 * @extends {AwsConfig}
 */
export type SnsConfig = {
  topicA: TopicData;
  topicB: TopicData;
} & AwsConfig;

/**
 * Parameters to describe an SNS topic subscription
 *
 * @export
 * @interface TopicData
 */
export type TopicData = {
  name: string;
  region: string;
  subscriptionArn: string;
  enabledFilter?: Record<string, any>;
  disabledFilter?: Record<string, any>;
};
