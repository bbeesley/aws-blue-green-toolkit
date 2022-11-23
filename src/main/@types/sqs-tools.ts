import type { AwsConfig } from './common.js';

/**
 * Configuration options for the SQS toolkit
 *
 * @export
 * @interface SqsConfig
 * @extends {AwsConfig}
 */
export type SqsConfig = {
  queueA: SqsQueue;
  queueB: SqsQueue;
} & AwsConfig;

export type SqsQueue = {
  queueName: string;
  dlqName?: string;
};
