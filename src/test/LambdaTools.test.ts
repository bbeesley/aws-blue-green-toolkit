import { LambdaTools, StackReference } from '../main';
import * as AWS from 'aws-sdk';

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
        FunctionName: 'fn-b-dev',
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
        FunctionName: 'fn-b-dev',
        Qualifier: 'live',
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
        FunctionName: 'fn-b-dev',
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
        FunctionName: 'fn-b-dev',
        Qualifier: 'live',
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
        Name:
          AWS.CloudWatchEvents._eventsResponses.listRuleNamesByTarget
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
        Name:
          AWS.CloudWatchEvents._eventsResponses.listRuleNamesByTarget
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
        Name:
          AWS.CloudWatchEvents._eventsResponses.listRuleNamesByTarget
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
        Name:
          AWS.CloudWatchEvents._eventsResponses.listRuleNamesByTarget
            .RuleNames[0],
      });
    });
  });
});
