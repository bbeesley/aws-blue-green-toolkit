import { PurgeQueueCommand } from '@aws-sdk/client-sqs';
import test from 'ava';
import { SqsTools, StackReference } from '../../dist/esm/index.js';
import { awsMocks, resetMocks } from './mock-aws.js';

test.serial.beforeEach(() => {
  resetMocks();
});

const configWithDlq = {
  awsRegion: 'eu-central-1',
  awsProfile: '555',
  environment: 'dev',
  namespace: 'fn',
  tags: {},
  queueA: {
    queueName: 'fn-queue-a-dev',
    dlqName: 'fn-dlq-a-dev',
  },
  queueB: {
    queueName: 'fn-queue-b-dev',
    dlqName: 'fn-dlq-b-dev',
  },
};

const configWithoutDlq = {
  awsRegion: 'eu-central-1',
  awsProfile: '555',
  environment: 'dev',
  namespace: 'fn',
  tags: {},
  queueA: {
    queueName: 'fn-queue-a-dev',
  },
  queueB: {
    queueName: 'fn-queue-b-dev',
  },
};

test.serial(
  'SqsTools > calls purgeQueues with expected params without dlq',
  async (t) => {
    const sqsTools = new SqsTools(configWithoutDlq);
    await sqsTools.purgeQueues(StackReference.b);
    t.truthy(
      awsMocks.mockSqs
        .calls()
        .filter((error) => error.args[0] instanceof PurgeQueueCommand)
        .find(
          (error) =>
            error.args[0].input.QueueUrl ===
            'https://sqs.eu-central-1.amazonaws.com/555/fn-queue-b-dev'
        )
    );
    t.falsy(
      awsMocks.mockSqs
        .calls()
        .find(
          (error) =>
            error.args[0]?.input.QueueUrl ===
            'https://sqs.eu-central-1.amazonaws.com/555/fn-dlq-b-dev'
        )
    );
  }
);

test.serial(
  'SqsTools > calls purgeQueues with expected params with dlq',
  async (t) => {
    const sqsTools = new SqsTools(configWithDlq);
    await sqsTools.purgeQueues(StackReference.b);
    t.truthy(
      awsMocks.mockSqs
        .calls()
        .filter((error) => error.args[0] instanceof PurgeQueueCommand)
        .find(
          (error) =>
            error.args[0].input.QueueUrl ===
            'https://sqs.eu-central-1.amazonaws.com/555/fn-queue-b-dev'
        )
    );
    t.truthy(
      awsMocks.mockSqs
        .calls()
        .filter((error) => error.args[0] instanceof PurgeQueueCommand)
        .find(
          (error) =>
            error.args[0].input.QueueUrl ===
            'https://sqs.eu-central-1.amazonaws.com/555/fn-dlq-b-dev'
        )
    );
  }
);
