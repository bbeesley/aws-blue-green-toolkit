import {
  DeregisterStreamConsumerCommand,
  DescribeStreamConsumerCommand,
  type DescribeStreamConsumerOutput,
  KinesisClient,
  RegisterStreamConsumerCommand,
  type RegisterStreamConsumerOutput,
} from '@aws-sdk/client-kinesis';
import type { KinesisConfig } from './@types/index.js';
import { StackReference } from './constants.js';

/**
 * Toolkit for Kinesis data stream operations
 *
 * @export
 * @class KinesisTools
 */
export class KinesisTools {
  public kinesis: KinesisClient;

  /**
   * Creates an instance of KinesisTools.
   *
   * @param {KinesisConfig} config - Configuration options for the Kinesis toolkit
   * @memberof KinesisTools
   */
  public constructor(public config: KinesisConfig) {
    this.config = config;
    this.kinesis = new KinesisClient({ region: this.config.awsRegion });
  }

  /**
   * Deregisters an existing consumer for a Kinesis data stream
   *
   * @param {StackReference} reference - Reference to an active stack
   * @returns {Promise<void>}
   * @memberof KinesisTools
   */
  public async deregisterConsumer(reference: StackReference): Promise<void> {
    await this.kinesis.send(
      new DeregisterStreamConsumerCommand({
        StreamARN: this.config.streamArn,
        ConsumerName: this.getConsumerName(reference),
      })
    );
  }

  /**
   * Describes a consumer for a Kinesis data stream
   *
   * @param {StackReference} reference - Reference to an active stack
   * @returns {Promise<DescribeStreamConsumerOutput>}
   * @memberof KinesisTools
   */
  public async describeConsumer(
    reference: StackReference
  ): Promise<DescribeStreamConsumerOutput> {
    return this.kinesis.send(
      new DescribeStreamConsumerCommand({
        StreamARN: this.config.streamArn,
        ConsumerName: this.getConsumerName(reference),
      })
    );
  }

  /**
   * Registers a new consumer for a Kinesis data stream
   *
   * @param {StackReference} reference - Reference to an active stack
   * @returns {Promise<RegisterStreamConsumerOutput>}
   * @memberof KinesisTools
   */
  public async registerConsumer(
    reference: StackReference
  ): Promise<RegisterStreamConsumerOutput> {
    return this.kinesis.send(
      new RegisterStreamConsumerCommand({
        StreamARN: this.config.streamArn,
        ConsumerName: this.getConsumerName(reference),
      })
    );
  }

  protected getConsumerName(
    ref: StackReference
  ): KinesisConfig['consumerNameA'] | KinesisConfig['consumerNameB'] {
    return ref === StackReference.a
      ? this.config.consumerNameA
      : this.config.consumerNameB;
  }
}
