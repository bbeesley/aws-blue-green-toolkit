import { SqsTools, StackReference } from '../main';
import * as AWS from 'aws-sdk';

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

describe('SqsTools', () => {
  describe('purgeQueues', () => {
    it('calls purgeQueues with expected params with dlq', async () => {
      const sqsTools = new SqsTools(configWithDlq);
      await sqsTools.purgeQueues(StackReference.b);
      expect(AWS.SQS._purgeQueue).toHaveBeenCalledWith({
        QueueUrl: 'https://sqs.eu-central-1.amazonaws.com/555/fn-queue-b-dev',
      });
      expect(AWS.SQS._purgeQueue).toHaveBeenCalledWith({
        QueueUrl: 'https://sqs.eu-central-1.amazonaws.com/555/fn-dlq-b-dev',
      });
    });
    it('calls purgeQueues with expected params without dlq', async () => {
      const sqsTools = new SqsTools(configWithoutDlq);
      await sqsTools.purgeQueues(StackReference.b);
      expect(AWS.SQS._purgeQueue).toHaveBeenCalledWith({
        QueueUrl: 'https://sqs.eu-central-1.amazonaws.com/555/fn-queue-b-dev',
      });
      expect(AWS.SQS._purgeQueue).not.toHaveBeenCalledWith({
        QueueUrl: 'https://sqs.eu-central-1.amazonaws.com/555/fn-dlq-b-dev',
      });
    });
  });
});
