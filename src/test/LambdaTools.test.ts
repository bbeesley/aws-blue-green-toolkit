import * as AWS from 'aws-sdk';
import { LambdaTools, StackReference } from '../main';

const lambdaTools = new LambdaTools({
  awsRegion: 'eu-central-1',
  awsProfile: '555',
  environment: 'dev',
  namespace: 'fn',
  tags: {},
  lambdaNameA: 'fn-a-dev',
  lambdaNameB: 'fn-b-dev',
});

describe('LambdaTools', () => {
  describe('enableEventMapping', () => {
    it('calls updateEventSourceMapping with expected params', async () => {
      await lambdaTools.enableEventMapping(StackReference.b);
      expect(AWS.Lambda._listEventSourceMappings).toHaveBeenCalledWith({
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
      });
      expect(AWS.Lambda._updateEventSourceMapping).toHaveBeenCalledWith({
        UUID: 'uuid',
        Enabled: true,
      });
    });
    it('calls updateEventSourceMapping with expected params and variant', async () => {
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
      expect(AWS.Lambda._listEventSourceMappings).toHaveBeenCalledWith({
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
      });
      expect(AWS.Lambda._updateEventSourceMapping).toHaveBeenCalledWith({
        UUID: 'uuid',
        Enabled: true,
      });
    });
  });
  describe('disableEventMapping', () => {
    it('calls updateEventSourceMapping with expected params', async () => {
      await lambdaTools.disableEventMapping(StackReference.b);
      expect(AWS.Lambda._listEventSourceMappings).toHaveBeenCalledWith({
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
      });
      expect(AWS.Lambda._updateEventSourceMapping).toHaveBeenCalledWith({
        UUID: 'uuid',
        Enabled: false,
      });
    });
    it('calls updateEventSourceMapping with expected params and variant', async () => {
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
      expect(AWS.Lambda._listEventSourceMappings).toHaveBeenCalledWith({
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
      });
      expect(AWS.Lambda._updateEventSourceMapping).toHaveBeenCalledWith({
        UUID: 'uuid',
        Enabled: false,
      });
    });
  });
  describe('enableRule', () => {
    it('calls enableRule with expected params', async () => {
      await lambdaTools.enableRule(StackReference.b);
      expect(AWS.CloudWatchEvents._listRuleNamesByTarget).toHaveBeenCalledWith({
        TargetArn: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
      });
      expect(AWS.CloudWatchEvents._enableRule).toHaveBeenCalledWith({
        Name: AWS.CloudWatchEvents._eventsResponses.listRuleNamesByTarget
          .RuleNames[0],
      });
    });
    it('calls enableRule with expected params and variant', async () => {
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
      expect(AWS.CloudWatchEvents._listRuleNamesByTarget).toHaveBeenCalledWith({
        TargetArn: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
      });
      expect(AWS.CloudWatchEvents._enableRule).toHaveBeenCalledWith({
        Name: AWS.CloudWatchEvents._eventsResponses.listRuleNamesByTarget
          .RuleNames[0],
      });
    });
  });
  describe('disableRule', () => {
    it('calls disableRule with expected params', async () => {
      await lambdaTools.disableRule(StackReference.b);
      expect(AWS.CloudWatchEvents._listRuleNamesByTarget).toHaveBeenCalledWith({
        TargetArn: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
      });
      expect(AWS.CloudWatchEvents._disableRule).toHaveBeenCalledWith({
        Name: AWS.CloudWatchEvents._eventsResponses.listRuleNamesByTarget
          .RuleNames[0],
      });
    });
    it('calls disableRule with expected params and alias', async () => {
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
      expect(AWS.CloudWatchEvents._listRuleNamesByTarget).toHaveBeenCalledWith({
        TargetArn: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
      });
      expect(AWS.CloudWatchEvents._disableRule).toHaveBeenCalledWith({
        Name: AWS.CloudWatchEvents._eventsResponses.listRuleNamesByTarget
          .RuleNames[0],
      });
    });
  });
  describe('listEventSourceMappings', () => {
    it('calls listEventSourceMappings with expected params', async () => {
      const mappings = await lambdaTools.listEventSourceMappings(
        StackReference.b
      );
      expect(AWS.Lambda._listEventSourceMappings).toHaveBeenCalledWith({
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
      });
      expect(mappings).not.toBeUndefined();
    });
    it('calls updateEventSourceMapping with expected params and variant', async () => {
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
      expect(AWS.Lambda._listEventSourceMappings).toHaveBeenCalledWith({
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
      });
      expect(mappings).not.toBeUndefined();
    });
  });
  describe('createEventSourceMapping', () => {
    it('calls createEventSourceMapping with expected params', async () => {
      const mapping = await lambdaTools.createEventSourceMapping(
        StackReference.b,
        'some-arn',
        {
          StartingPosition: 'TRIM_HORIZON',
        }
      );
      expect(AWS.Lambda._createEventSourceMapping).toHaveBeenCalledWith({
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev',
        EventSourceArn: 'some-arn',
        StartingPosition: 'TRIM_HORIZON',
      });
      expect(mapping).not.toBeUndefined();
    });
    it('calls updateEventSourceMapping with expected params and variant', async () => {
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
      expect(AWS.Lambda._createEventSourceMapping).toHaveBeenCalledWith({
        FunctionName: 'arn:aws:lambda:eu-central-1:555:function:fn-b-dev:live',
        EventSourceArn: 'some-arn',
      });
      expect(mapping).not.toBeUndefined();
    });
  });
  describe('deleteEventMapping', () => {
    it('calls deleteEventMapping with expected params', async () => {
      const UUID = '091a66ea-1d4c-411c-97f0-039905401602';

      await lambdaTools.deleteEventMapping(UUID);
      expect(AWS.Lambda._deleteEventSourceMapping).toHaveBeenCalledWith({
        UUID,
      });
    });
  });
  describe('getLatestMetrics', () => {
    it('returns the latest metrics for the given lambda fn', async () => {
      const latestMetrics = await lambdaTools.getLatestMetrics(
        StackReference.b
      );
      expect(AWS.CloudWatch._getMetricData).toHaveBeenCalledTimes(1);

      expect(latestMetrics).toMatchSnapshot();
    });
  });
});
