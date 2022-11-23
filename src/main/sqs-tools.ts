import { PurgeQueueCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { SqsConfig, SqsQueue } from './@types/index.js';
import { StackReference } from './constants.js';

/**
 * Toolkit for SQS operations
 *
 * @export
 * @class SqsTools
 */
export class SqsTools {
  public sqs: SQSClient;

  /**
   * Creates an instance of SqsTools.
   *
   * @param {SqsConfig} config - Config describing the SQS queue pair
   * @memberof SqsTools
   */
  constructor(public config: SqsConfig) {
    this.config = config;
    this.sqs = new SQSClient({ region: this.config.awsRegion });
  }

  /**
   * Purges a queue pair (q and dlq) based on config and queue reference
   *
   * @param {StackReference} reference - Reference to a subscription queue stack
   * @returns {Promise<void>}
   * @memberof SqsTools
   */
  public async purgeQueues(reference: StackReference): Promise<void> {
    const queue = this.getQueue(reference);
    await Promise.all(
      Object.values(queue).map(async (queueName) => {
        if (queueName) {
          await this.sqs.send(
            new PurgeQueueCommand({
              QueueUrl: `https://sqs.${this.config.awsRegion}.amazonaws.com/${this.config.awsProfile}/${queueName}`,
            })
          );
        }
      })
    );
  }

  private getQueue(ref: StackReference): SqsQueue {
    return ref === StackReference.a ? this.config.queueA : this.config.queueB;
  }
}
