import { SnsTools, StackReference } from '../main';
import * as AWS from 'aws-sdk';

const config = {
  awsRegion: 'eu-central-1',
  awsProfile: '555',
  environment: 'dev',
  namespace: 'fn',
  tags: {},
  topicA: {
    name: 'fn-updates-a-dev',
    region: 'eu-central-1',
    subscriptionArn:
      'arn:aws:sns:eu-central-1:555:fn-updates-a-dev:4e441b93-5db8-4773-840b-deed0ba5f601',
  },
  topicB: {
    name: 'fn-updates-b-dev',
    region: 'eu-central-1',
    subscriptionArn:
      'arn:aws:sns:eu-central-1:555:fn-updates-b-dev:0fde1a8e-5130-41d1-932a-c80d961b1a70',
  },
};

const snsTools = new SnsTools(config);

describe('SnsTools', () => {
  describe('enableSubscription', () => {
    it('calls setSubscriptionAttributes with expected params', async () => {
      await snsTools.enableSubscription(StackReference.b);
      expect(AWS.SNS._setSubscriptionAttributes).toHaveBeenCalledWith({
        AttributeName: 'FilterPolicy',
        SubscriptionArn: config.topicB.subscriptionArn,
        AttributeValue: JSON.stringify({}),
      });
    });
  });
  describe('disableSubscription', () => {
    it('calls setSubscriptionAttributes with expected params', async () => {
      await snsTools.disableSubscription(StackReference.b);
      expect(AWS.SNS._setSubscriptionAttributes).toHaveBeenCalledWith({
        AttributeName: 'FilterPolicy',
        SubscriptionArn: config.topicB.subscriptionArn,
        AttributeValue: JSON.stringify({
          bypassBlacklist: true,
        }),
      });
    });
  });
});
