import test from 'ava';

import { KinesisTools, StackReference } from '../../dist/esm/index.js';
import { awsMocks, resetMocks } from './mock-aws.js';

test.serial.beforeEach(() => {
  resetMocks();
});

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

test.serial(
  'KinesisTools > calls describeConsumer with expected params',
  async (t) => {
    const consumerDescription = await kinesisTools.describeConsumer(
      StackReference.b
    );

    t.deepEqual(awsMocks.mockKinesis.calls()[0].args[0].input, {
      ConsumerName: config.consumerNameB,
      StreamARN: config.streamArn,
    });

    t.truthy(consumerDescription);
  }
);

test.serial(
  'KinesisTools > calls deregisterConsumer with expected params',
  async (t) => {
    await kinesisTools.deregisterConsumer(StackReference.b);

    t.deepEqual(awsMocks.mockKinesis.calls()[0].args[0].input, {
      ConsumerName: config.consumerNameB,
      StreamARN: config.streamArn,
    });
  }
);

test.serial(
  'KinesisTools > calls registerConsumer with expected params',
  async (t) => {
    const consumer = await kinesisTools.registerConsumer(StackReference.a);

    t.deepEqual(awsMocks.mockKinesis.calls()[0].args[0].input, {
      ConsumerName: config.consumerNameA,
      StreamARN: config.streamArn,
    });
    t.truthy(consumer);
  }
);
