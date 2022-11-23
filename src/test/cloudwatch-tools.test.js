import {
  DisableAlarmActionsCommand,
  EnableAlarmActionsCommand,
} from '@aws-sdk/client-cloudwatch';
import test from 'ava';

import { CloudWatchTools, StackReference } from '../../dist/esm/index.js';
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
  alarmStackA: {
    alarmPrefix: `mock service - dev`,
    alarmSuffix: '- A',
  },
  alarmStackB: {
    alarmPrefix: `mock service - dev`,
    alarmSuffix: '- B',
  },
};

const cloudWatchTools = new CloudWatchTools(config);

test.serial(
  'CloudWatchTools > calls enableAlarmsActions with expected params',
  async (t) => {
    await cloudWatchTools.enableAlarmsActions(StackReference.b);
    t.deepEqual(
      awsMocks.mockCloudwatch
        .calls()
        .find((error) => error.args[0] instanceof EnableAlarmActionsCommand)
        .args[0].input,
      {
        AlarmNames: [
          'mock service - dev - lambda1 - B',
          'mock service - dev - lambda2 - B',
          'mock service - dev - lambda3 - B',
        ],
      }
    );
  }
);

test.serial(
  'CloudWatchTools > calls disableAlarmsActions with expected params',
  async (t) => {
    await cloudWatchTools.disableAlarmsActions(StackReference.b);
    t.deepEqual(
      awsMocks.mockCloudwatch
        .calls()
        .find((error) => error.args[0] instanceof DisableAlarmActionsCommand)
        .args[0].input,
      {
        AlarmNames: [
          'mock service - dev - lambda1 - B',
          'mock service - dev - lambda2 - B',
          'mock service - dev - lambda3 - B',
        ],
      }
    );
  }
);
