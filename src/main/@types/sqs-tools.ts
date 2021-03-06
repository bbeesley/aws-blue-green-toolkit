import { AwsConfig } from './common';

/**
 * Configuration options for the SQS toolkit
 * @export
 * @interface SqsConfig
 * @extends {AwsConfig}
 */
export interface SqsConfig extends AwsConfig {
  queueA: SqsQueue;
  queueB: SqsQueue;
}

export interface SqsQueue {
  queueName: string;
  dlqName?: string;
}
