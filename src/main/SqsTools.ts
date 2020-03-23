import { SQS } from 'aws-sdk';

import { AwsConfig } from './common-interfaces';
import { StackReference } from './constants';

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

interface SqsQueue {
  queueName: string;
  dlqName?: string;
}

/**
 * Toolkit for SQS operations
 * @export
 * @class SqsTools
 */
export class SqsTools {
  config: SqsConfig;
  sqs: SQS;

  /**
   * Creates an instance of SqsTools.
   * @param {SqsConfig} config
   * @memberof SqsTools
   */
  constructor(config: SqsConfig) {
    this.config = config;
    this.sqs = new SQS({ region: this.config.awsRegion });
  }

  private getQueue(ref: StackReference): SqsQueue {
    return ref === StackReference.a ? this.config.queueA : this.config.queueB;
  }

  /**
   * Purges a queue pair (q and dlq) based on config and queue reference
   * @param {StackReference} reference - Reference to a subscription queue stack
   * @returns {Promise<void>}
   * @memberof SqsTools
   */
  public async purgeQueues(reference: StackReference): Promise<void> {
    const queue = this.getQueue(reference);
    await Promise.all(
      Object.values(queue).map(async (queueName) => {
        if (queueName) {
          await this.sqs
            .purgeQueue({
              QueueUrl: `https://sqs.${this.config.awsRegion}.amazonaws.com/${this.config.awsProfile}/${queueName}`,
            })
            .promise();
        }
      })
    );
  }
}
