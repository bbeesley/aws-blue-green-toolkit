import {
  SetSubscriptionAttributesCommand,
  SNSClient,
} from '@aws-sdk/client-sns';
import type { SnsConfig, TopicData } from './@types/index.js';
import { StackReference } from './constants.js';

const enabledFilter = {};
const disabledFilter = {
  bypassBlacklist: true,
};

enum Operation {
  ENABLE,
  DISABLE,
}

class Topic {
  public disabledFilter: Record<string, any>;
  public enabledFilter: Record<string, any>;
  public name: string;
  public region: string;
  public subscriptionArn: string;

  constructor(d: TopicData) {
    this.name = d.name;
    this.region = d.region;
    this.subscriptionArn = d.subscriptionArn;
    this.enabledFilter = d.enabledFilter ?? enabledFilter;
    this.disabledFilter = d.disabledFilter ?? disabledFilter;
  }
}

/**
 * Toolkit for SNS operations
 *
 * @export
 * @class SnsTools
 */
export class SnsTools {
  public topicA: Topic;
  public topicB: Topic;

  /**
   *Creates an instance of SnsTools.
   *
   * @param {SnsConfig} config - Config describing the sns topic pair
   * @memberof SnsTools
   */
  constructor(public config: SnsConfig) {
    this.config = config;
    this.topicA = new Topic(config.topicA);
    this.topicB = new Topic(config.topicB);
  }

  /**
   * Disables an SNS subscription
   *
   * @param {StackReference} reference - Reference to a subscription queue stack
   * @returns {Promise<void>}
   * @memberof SnsTools
   */
  public async disableSubscription(reference: StackReference): Promise<void> {
    await this.updateFilters(Operation.DISABLE, reference);
  }

  /**
   * Enables an SNS subscription
   *
   * @param {StackReference} reference - Reference to a subscription queue stack
   * @returns {Promise<void>}
   * @memberof SnsTools
   */
  public async enableSubscription(reference: StackReference): Promise<void> {
    await this.updateFilters(Operation.ENABLE, reference);
  }

  private getTopic(ref: StackReference): Topic {
    return ref === StackReference.a ? this.topicA : this.topicB;
  }

  private async updateFilters(
    operation: Operation,
    ref: StackReference
  ): Promise<void> {
    const topic = this.getTopic(ref);
    const AttributeValue =
      operation === Operation.DISABLE
        ? JSON.stringify(topic.disabledFilter)
        : JSON.stringify(topic.enabledFilter);
    const sns = new SNSClient({ region: topic.region });
    await sns.send(
      new SetSubscriptionAttributesCommand({
        AttributeName: 'FilterPolicy',
        SubscriptionArn: topic.subscriptionArn,
        AttributeValue,
      })
    );
  }
}
