import { SetSubscriptionAttributesCommand } from '@aws-sdk/client-sns';
import test from 'ava';

import { SnsTools, StackReference } from '../../dist/index.js';
import { awsMocks, resetMocks } from './mockAws.js';

test.serial.beforeEach(() => {
  resetMocks();
});

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

test.serial(
  'SnsTools disableSubscription > calls setSubscriptionAttributes with expected params',
  async (t) => {
    await snsTools.disableSubscription(StackReference.b);
    t.deepEqual(
      awsMocks.mockSns
        .calls()
        .find((e) => e.args[0] instanceof SetSubscriptionAttributesCommand)
        .args[0]?.input,
      {
        AttributeName: 'FilterPolicy',
        SubscriptionArn: config.topicB.subscriptionArn,
        AttributeValue: JSON.stringify({
          bypassBlacklist: true,
        }),
      }
    );
  }
);

test.serial(
  'SnsTools enableSubscription > calls setSubscriptionAttributes with expected params',
  async (t) => {
    await snsTools.enableSubscription(StackReference.b);
    t.deepEqual(
      awsMocks.mockSns
        .calls()
        .find((e) => e.args[0] instanceof SetSubscriptionAttributesCommand)
        .args[0]?.input,
      {
        AttributeName: 'FilterPolicy',
        SubscriptionArn: config.topicB.subscriptionArn,
        AttributeValue: JSON.stringify({}),
      }
    );
  }
);
