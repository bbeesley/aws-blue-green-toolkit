import { CloudWatchTools, StackReference } from '../main';
import * as AWS from 'aws-sdk';

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

describe('CloudWatchTools', () => {
  describe('disableAlarmsActions', () => {
    it('calls disableAlarmsActions with expected params', async () => {
      await cloudWatchTools.disableAlarmsActions(StackReference.b);
      expect(AWS.CloudWatch._disableAlarmActions).toHaveBeenCalledWith({
        AlarmNames: [
          'mock service - dev - lambda1 - B',
          'mock service - dev - lambda2 - B',
          'mock service - dev - lambda3 - B',
        ]
      });
    });
  });
  describe('enableAlarmsActions', () => {
    it('calls enableAlarmsActions with expected params', async () => {
      await cloudWatchTools.enableAlarmsActions(StackReference.b);
      expect(AWS.CloudWatch._enableAlarmActions).toHaveBeenCalledWith({
        AlarmNames: [
          'mock service - dev - lambda1 - B',
          'mock service - dev - lambda2 - B',
          'mock service - dev - lambda3 - B',
        ]
      });
    });
  });
});
