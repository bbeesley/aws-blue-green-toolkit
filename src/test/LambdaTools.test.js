import test from 'ava';
import {
  CreateEventSourceMappingCommand,
  DeleteEventSourceMappingCommand,
  ListEventSourceMappingsCommand,
  UpdateEventSourceMappingCommand,
} from '@aws-sdk/client-lambda';
import {
  DisableRuleCommand,
  EnableRuleCommand,
  ListRuleNamesByTargetCommand,
} from '@aws-sdk/client-cloudwatch-events';
import { LambdaTools, StackReference } from '../../dist/index.js';
import { awsMocks, eventsResponses, resetMocks } from './mockAws.js';

test.serial.beforeEach(() => {
  resetMocks();
});

const lambdaTools = new LambdaTools({
  awsRegion: 'eu-central-1',
  awsProfile: '555',
  environment: 'dev',
  namespace: 'fn',
  tags: {},
  lambdaNameA: 'fn-a-dev',
  lambdaNameB: 'fn-b-dev',
});

test.serial(
  'LambdaTools getLatestMetrics > returns the latest metrics for the given lambda fn',
  async (t) => {
    const latestMetrics = await lambdaTools.getLatestMetrics(StackReference.b);
    t.true(awsMocks.mockCloudwatch.send.calledOnce);

    t.snapshot(latestMetrics);
  }
);

test.serial(
  'LambdaTools deleteEventMapping > calls deleteEventMapping with expected params',
  async (t) => {
    const UUID = '091a66ea-1d4c-411c-97f0-039905401602';

    await lambdaTools.deleteEventMapping(UUID);

    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof DeleteEventSourceMappingCommand)
        .args[0]?.input,
      {
        UUID,
      }
    );
  }
);

test.serial(
  'LambdaTools createEventSourceMapping > calls updateEventSourceMapping with expected params and variant',
  async (t) => {
    const lambda = new LambdaTools({
      awsRegion: 'eu-central-1',
      awsProfile: '555',
      environment: 'dev',
      namespace: 'fn',
      tags: {},
      lambdaNameA: 'fn-a-dev',
      lambdaNameB: 'fn-b-dev',
      alias: 'live',
    });
    const mapping = await lambda.createEventSourceMapping(
      StackReference.b,
      'some-arn'
    );
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof CreateEventSourceMappingCommand)
        .args[0]?.input,
      {
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
        EventSourceArn: 'some-arn',
      }
    );
    t.truthy(mapping);
  }
);

test.serial(
  'LambdaTools createEventSourceMapping > calls createEventSourceMapping with expected params',
  async (t) => {
    const mapping = await lambdaTools.createEventSourceMapping(
      StackReference.b,
      'some-arn',
      {
        StartingPosition: 'TRIM_HORIZON',
      }
    );
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof CreateEventSourceMappingCommand)
        .args[0]?.input,
      {
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
        EventSourceArn: 'some-arn',
        StartingPosition: 'TRIM_HORIZON',
      }
    );
    t.truthy(mapping);
  }
);

test.serial(
  'LambdaTools listEventSourceMappings > calls updateEventSourceMapping with expected params and variant',
  async (t) => {
    const lambda = new LambdaTools({
      awsRegion: 'eu-central-1',
      awsProfile: '555',
      environment: 'dev',
      namespace: 'fn',
      tags: {},
      lambdaNameA: 'fn-a-dev',
      lambdaNameB: 'fn-b-dev',
      alias: 'live',
    });
    const mappings = await lambda.listEventSourceMappings(StackReference.b);
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof ListEventSourceMappingsCommand)
        .args[0]?.input,
      {
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
      }
    );
    t.truthy(mappings);
  }
);

test.serial(
  'LambdaTools listEventSourceMappings > calls listEventSourceMappings with expected params',
  async (t) => {
    const mappings = await lambdaTools.listEventSourceMappings(
      StackReference.b
    );
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof ListEventSourceMappingsCommand)
        .args[0]?.input,
      {
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
      }
    );
    t.truthy(mappings);
  }
);

test.serial(
  'LambdaTools disableRule > calls disableRule with expected params and alias',
  async (t) => {
    const lambda = new LambdaTools({
      awsRegion: 'eu-central-1',
      awsProfile: '555',
      environment: 'dev',
      namespace: 'fn',
      tags: {},
      lambdaNameA: 'fn-a-dev',
      lambdaNameB: 'fn-b-dev',
      alias: 'live',
    });
    await lambda.disableRule(StackReference.b);
    t.deepEqual(
      awsMocks.mockEvents
        .calls()
        .find((e) => e.args[0] instanceof ListRuleNamesByTargetCommand).args[0]
        ?.input,
      {
        TargetArn: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
      }
    );
    t.deepEqual(
      awsMocks.mockEvents
        .calls()
        .find((e) => e.args[0] instanceof DisableRuleCommand).args[0]?.input,
      {
        Name: eventsResponses.listRuleNamesByTarget.RuleNames[0],
      }
    );
  }
);

test.serial(
  'LambdaTools disableRule > calls disableRule with expected params',
  async (t) => {
    await lambdaTools.disableRule(StackReference.b);
    t.deepEqual(
      awsMocks.mockEvents
        .calls()
        .find((e) => e.args[0] instanceof ListRuleNamesByTargetCommand).args[0]
        ?.input,
      {
        TargetArn: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
      }
    );
    t.deepEqual(
      awsMocks.mockEvents
        .calls()
        .find((e) => e.args[0] instanceof DisableRuleCommand).args[0]?.input,
      {
        Name: eventsResponses.listRuleNamesByTarget.RuleNames[0],
      }
    );
  }
);

test.serial(
  'LambdaTools enableRule > calls enableRule with expected params and variant',
  async (t) => {
    const lambda = new LambdaTools({
      awsRegion: 'eu-central-1',
      awsProfile: '555',
      environment: 'dev',
      namespace: 'fn',
      tags: {},
      lambdaNameA: 'fn-a-dev',
      lambdaNameB: 'fn-b-dev',
      alias: 'live',
    });
    await lambda.enableRule(StackReference.b);
    t.deepEqual(
      awsMocks.mockEvents
        .calls()
        .find((e) => e.args[0] instanceof ListRuleNamesByTargetCommand).args[0]
        ?.input,
      {
        TargetArn: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
      }
    );
    t.deepEqual(
      awsMocks.mockEvents
        .calls()
        .find((e) => e.args[0] instanceof EnableRuleCommand).args[0]?.input,
      {
        Name: eventsResponses.listRuleNamesByTarget.RuleNames[0],
      }
    );
  }
);

test.serial(
  'LambdaTools enableRule > calls enableRule with expected params',
  async (t) => {
    await lambdaTools.enableRule(StackReference.b);
    t.deepEqual(
      awsMocks.mockEvents
        .calls()
        .find((e) => e.args[0] instanceof ListRuleNamesByTargetCommand).args[0]
        ?.input,
      {
        TargetArn: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
      }
    );
    t.deepEqual(
      awsMocks.mockEvents
        .calls()
        .find((e) => e.args[0] instanceof EnableRuleCommand).args[0]?.input,
      {
        Name: eventsResponses.listRuleNamesByTarget.RuleNames[0],
      }
    );
  }
);

test.serial(
  'LambdaTools disableEventMapping > calls updateEventSourceMapping with expected params and variant',
  async (t) => {
    const lambda = new LambdaTools({
      awsRegion: 'eu-central-1',
      awsProfile: '555',
      environment: 'dev',
      namespace: 'fn',
      tags: {},
      lambdaNameA: 'fn-a-dev',
      lambdaNameB: 'fn-b-dev',
      alias: 'live',
    });
    await lambda.disableEventMapping(StackReference.b);
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof ListEventSourceMappingsCommand)
        .args[0]?.input,
      {
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
      }
    );
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof UpdateEventSourceMappingCommand)
        .args[0]?.input,
      {
        UUID: 'uuid',
        Enabled: false,
      }
    );
  }
);

test.serial(
  'LambdaTools > calls updateEventSourceMapping with expected params',
  async (t) => {
    await lambdaTools.disableEventMapping(StackReference.b);
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof ListEventSourceMappingsCommand)
        .args[0]?.input,
      {
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
      }
    );
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof UpdateEventSourceMappingCommand)
        .args[0]?.input,
      {
        UUID: 'uuid',
        Enabled: false,
      }
    );
  }
);

test.serial(
  'LambdaTools enableEventMapping > calls updateEventSourceMapping with expected params and variant',
  async (t) => {
    const lambda = new LambdaTools({
      awsRegion: 'eu-central-1',
      awsProfile: '555',
      environment: 'dev',
      namespace: 'fn',
      tags: {},
      lambdaNameA: 'fn-a-dev',
      lambdaNameB: 'fn-b-dev',
      alias: 'live',
    });
    await lambda.enableEventMapping(StackReference.b);
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof ListEventSourceMappingsCommand)
        .args[0]?.input,
      {
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
      }
    );
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof UpdateEventSourceMappingCommand)
        .args[0]?.input,
      {
        UUID: 'uuid',
        Enabled: true,
      }
    );
  }
);

test.serial(
  'LambdaTools enableEventMapping > calls updateEventSourceMapping with expected params',
  async (t) => {
    await lambdaTools.enableEventMapping(StackReference.b);
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof ListEventSourceMappingsCommand)
        .args[0]?.input,
      {
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
      }
    );
    t.deepEqual(
      awsMocks.mockLambda
        .calls()
        .find((e) => e.args[0] instanceof UpdateEventSourceMappingCommand)
        .args[0]?.input,
      {
        UUID: 'uuid',
        Enabled: true,
      }
    );
  }
);
