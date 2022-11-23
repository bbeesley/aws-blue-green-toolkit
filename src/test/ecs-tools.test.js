import test from 'ava';

import { EcsTools, StackReference } from '../../dist/esm/index.js';
import { awsMocks, resetMocks } from './mock-aws.js';

test.serial.beforeEach(() => {
  resetMocks();
});

const config = {
  awsRegion: 'eu-central-1',
  awsProfile: '555',
  environment: 'prod',
  tags: {},
  serviceNameA: 'thing-runner-a-prod',
  serviceNameB: 'thing-runner-b-prod',
  desiredTasks: 1,
  cluster: 'deep-sea-fargate',
};

const tools = new EcsTools(config);

test.serial('disableService sets desired count to 0', async (t) => {
  await tools.disableService(StackReference.a);
  t.true(awsMocks.mockEcs.send.calledOnce);
  t.snapshot(awsMocks.mockEcs.send.lastCall.args[0].input);
});

test.serial('disableService modifies the correct service', async (t) => {
  await tools.disableService(StackReference.b);
  t.true(awsMocks.mockEcs.send.calledOnce);
  t.is(
    awsMocks.mockEcs.send.lastCall.args[0].input.service,
    config.serviceNameB
  );
});

test.serial(
  'enableService sets desired count to to the normal level',
  async (t) => {
    await tools.enableService(StackReference.a);
    t.true(awsMocks.mockEcs.send.calledOnce);
    t.snapshot(awsMocks.mockEcs.send.lastCall.args[0].input);
  }
);

test.serial('enableService modifies the correct service', async (t) => {
  await tools.enableService(StackReference.b);
  t.true(awsMocks.mockEcs.send.calledOnce);
  t.is(
    awsMocks.mockEcs.send.lastCall.args[0].input.service,
    config.serviceNameB
  );
  t.is(
    awsMocks.mockEcs.send.lastCall.args[0].input.desiredCount,
    config.desiredTasks
  );
});
