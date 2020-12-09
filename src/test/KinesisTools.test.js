import * as AWS from 'aws-sdk';

import { KinesisTools, StackReference } from '../main';

const config = {
  awsRegion: 'eu-central-1',
  awsProfile: '555',
  environment: 'dev',
  namespace: 'fn',
  tags: {},
  streamArn: 'arn:aws:kinesis:eu-central-1:123456789:stream/my-stream-dev',
  consumerNameA: 'con1A',
  consumerNameB: 'con1B',
};

const kinesisTools = new KinesisTools(config);

describe('KinesisTools', () => {
  describe('registerConsumer', () => {
    it('calls registerConsumer with expected params', async () => {
      const consumer = await kinesisTools.registerConsumer(StackReference.a);

      expect(AWS.Kinesis._registerStreamConsumer).toHaveBeenCalledTimes(1);
      expect(AWS.Kinesis._registerStreamConsumer).toHaveBeenCalledWith({
        ConsumerName: config.consumerNameA,
        StreamARN: config.streamArn,
      });
      expect(consumer).not.toBeUndefined();
    });
  });
  describe('registerConsumer', () => {
    it('calls deregisterConsumer with expected params', async () => {
      await kinesisTools.deregisterConsumer(StackReference.b);

      expect(AWS.Kinesis._deregisterStreamConsumer).toHaveBeenCalledTimes(1);
      expect(AWS.Kinesis._deregisterStreamConsumer).toHaveBeenCalledWith({
        ConsumerName: config.consumerNameB,
        StreamARN: config.streamArn,
      });
    });
  });
});
