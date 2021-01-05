import { Kinesis } from 'aws-sdk';
import {
  RegisterStreamConsumerOutput,
  DescribeStreamConsumerOutput,
} from 'aws-sdk/clients/kinesis';

import { AwsConfig } from './common-interfaces';
import { StackReference } from './constants';

/**
 * Configuration options for the Aurora toolkit
 * @export
 * @interface KinesisConfig
 * @extends {AwsConfig}
 */
export interface KinesisConfig extends AwsConfig {
  streamArn: string;
  consumerNameA: string;
  consumerNameB: string;
}

/**
 * Toolkit for Kinesis data stream operations
 * @export
 * @class KinesisTools
 */
export class KinesisTools {
  config: KinesisConfig;
  kinesis: Kinesis;

  /**
   * Creates an instance of KinesisTools.
   * @param {KinesisConfig} config - Configuration options for the Kinesis toolkit
   * @memberof KinesisTools
   */
  public constructor(config: KinesisConfig) {
    this.config = config;
    this.kinesis = new Kinesis({ region: this.config.awsRegion });
  }

  protected getConsumerName(
    ref: StackReference
  ): KinesisConfig['consumerNameA'] | KinesisConfig['consumerNameB'] {
    return ref === StackReference.a
      ? this.config.consumerNameA
      : this.config.consumerNameB;
  }

  /**
   * Registers a new consumer for a Kinesis data stream
   * @param {StackReference} reference - Reference to an active stack
   * @returns {Promise<RegisterStreamConsumerOutput>}
   * @memberof KinesisTools
   */
  public async registerConsumer(
    reference: StackReference
  ): Promise<RegisterStreamConsumerOutput> {
    return await this.kinesis
      .registerStreamConsumer({
        StreamARN: this.config.streamArn,
        ConsumerName: this.getConsumerName(reference),
      })
      .promise();
  }

  /**
   * Deregisters an existing consumer for a Kinesis data stream
   * @param {StackReference} reference - Reference to an active stack
   * @returns {Promise<void>}
   * @memberof KinesisTools
   */
  public async deregisterConsumer(reference: StackReference): Promise<void> {
    await this.kinesis
      .deregisterStreamConsumer({
        StreamARN: this.config.streamArn,
        ConsumerName: this.getConsumerName(reference),
      })
      .promise();
  }

  /**
   * Describes a consumer for a Kinesis data stream
   * @param {StackReference} reference - Reference to an active stack
   * @returns {Promise<DescribeStreamConsumerOutput>}
   * @memberof KinesisTools
   */
  public async describeConsumer(
    reference: StackReference
  ): Promise<DescribeStreamConsumerOutput> {
    return await this.kinesis
      .describeStreamConsumer({
        StreamARN: this.config.streamArn,
        ConsumerName: this.getConsumerName(reference),
      })
      .promise();
  }
}
