import { CloudWatchEvents, Lambda } from 'aws-sdk';
import {
  AliasConfiguration,
  EventSourceMappingConfiguration,
  EventSourceMappingsList,
  ListEventSourceMappingsRequest,
} from 'aws-sdk/clients/lambda';

import { LambdaConfig, LatestLambdaMetricsMap } from './@types';
import { StackReference } from './constants';

enum Operation {
  ENABLE,
  DISABLE,
}

/**
 * Toolkit for Lambda operations
 * @export
 * @class LambdaTools
 */
export class LambdaTools {
  config: LambdaConfig;
  lambda: Lambda;
  events: CloudWatchEvents;

  /**
   * Creates an instance of LambdaTools.
   * @param {LambdaConfig} config - Configuration options for the Lambda toolkit
   * @memberof LambdaTools
   */
  constructor(config: LambdaConfig) {
    this.config = config;
    this.lambda = new Lambda({ region: this.config.awsRegion });
    this.events = new CloudWatchEvents({ region: this.config.awsRegion });
  }

  private getLambdaName(ref: StackReference): string {
    return ref === StackReference.a
      ? this.config.lambdaNameA
      : this.config.lambdaNameB;
  }

  private getLambdaArn(ref: StackReference): string {
    return ref === StackReference.a
      ? `arn:aws:lambda:${this.config.awsRegion}:${
          this.config.awsProfile
        }:function:${this.config.lambdaNameA}${
          this.config.alias ? ':' + this.config.alias : ''
        }`
      : `arn:aws:lambda:${this.config.awsRegion}:${
          this.config.awsProfile
        }:function:${this.config.lambdaNameB}${
          this.config.alias ? ':' + this.config.alias : ''
        }`;
  }

  private async modifyRule(op: Operation, ref: StackReference): Promise<void> {
    const TargetArn = this.getLambdaArn(ref);
    const { RuleNames = [] } = await this.events
      .listRuleNamesByTarget({ TargetArn })
      .promise();
    for (const Name of RuleNames) {
      if (op === Operation.ENABLE) {
        await this.events
          .enableRule({
            Name,
          })
          .promise();
      } else {
        await this.events
          .disableRule({
            Name,
          })
          .promise();
      }
    }
  }

  /**
   * Enables a lambda's cloudwatch events rule (ie, cron trigger)
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<void>}
   * @memberof LambdaTools
   */
  public async enableRule(reference: StackReference): Promise<void> {
    await this.modifyRule(Operation.ENABLE, reference);
  }

  /**
   * Disables a lambda's cloudwatch events rule (ie, cron trigger)
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<void>}
   * @memberof LambdaTools
   */
  public async disableRule(reference: StackReference): Promise<void> {
    await this.modifyRule(Operation.DISABLE, reference);
  }

  /**
   * Creates a lambda's event source mapping (eg, a Kinesis stream)
   * @param {StackReference} reference - Reference to a lambda stack
   * @param {string} eventSourceArn - The ARN of the event source
   * @param {Omit<Lambda.CreateEventSourceMappingRequest, 'FunctionName' | 'EventSourceArn'>} sourceSpecificParams - Any params specific to the event source
   * @returns {Promise<EventSourceMappingConfiguration>}
   * @memberof LambdaTools
   */
  public async createEventSourceMapping(
    reference: StackReference,
    eventSourceArn: string,
    sourceSpecificParams: Omit<
      Lambda.CreateEventSourceMappingRequest,
      'FunctionName' | 'EventSourceArn'
    > = {}
  ): Promise<EventSourceMappingConfiguration> {
    return await this.lambda
      .createEventSourceMapping({
        FunctionName: this.getLambdaArn(reference),
        EventSourceArn: eventSourceArn,
        ...sourceSpecificParams,
      })
      .promise();
  }

  /**
   * Lists all event source mappings for the referenced function
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<EventSourceMappingsList>}
   * @memberof LambdaTools
   */
  public async listEventSourceMappings(
    reference: StackReference
  ): Promise<EventSourceMappingsList> {
    const mappings = [];

    const params: ListEventSourceMappingsRequest = {
      FunctionName: this.getLambdaArn(reference),
    };
    do {
      const result = await this.lambda
        .listEventSourceMappings(params)
        .promise();
      if (result.EventSourceMappings)
        mappings.push(...result.EventSourceMappings);

      if (result.NextMarker) params.Marker = result.NextMarker;
    } while (params.Marker);

    return mappings;
  }

  private async modifyEventMapping(
    op: Operation,
    ref: StackReference
  ): Promise<void> {
    const eventSourceMappings = await this.listEventSourceMappings(ref);
    if (eventSourceMappings.length > 0) {
      const Enabled = op === Operation.ENABLE;
      for (const mapping of eventSourceMappings) {
        const { UUID } = mapping;
        await this.lambda.updateEventSourceMapping({ UUID, Enabled }).promise();
      }
    }
  }

  /**
   * Enables a lambda's event mappings (eg, an SQS subscription)
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<void>}
   * @memberof LambdaTools
   */
  public async enableEventMapping(reference: StackReference): Promise<void> {
    await this.modifyEventMapping(Operation.ENABLE, reference);
  }

  /**
   * Disables a lambda's event mappings (eg, an SQS subscription)
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<void>}
   * @memberof LambdaTools
   */
  public async disableEventMapping(reference: StackReference): Promise<void> {
    await this.modifyEventMapping(Operation.DISABLE, reference);
  }

  /**
   * Deletes a lambda's event mapping (eg, a Kinesis stream)
   * You may use the `listEventSourceMappings` method if you
   * need to retrieve UUIDs of the function event sources
   * @param {StackReference} UUID - The identifier of the event source mapping
   * @returns {Promise<void>}
   * @memberof LambdaTools
   */
  public async deleteEventMapping(UUID: string): Promise<void> {
    await this.lambda.deleteEventSourceMapping({ UUID }).promise();
  }

  /**
   * Gets the currently running version of a lambda fn
   *
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<string>} - The lambda version
   * @memberof LambdaTools
   */
  public async getVersion(reference: StackReference): Promise<string> {
    const FunctionName = this.getLambdaName(reference);
    const info = await this.lambda.getFunction({ FunctionName }).promise();
    return info.Configuration.Version;
  }

  /**
   * Returns details about a Lambda function alias.
   *
   * @param {StackReference} reference - Reference to a lambda stack
   * @param {string} Name - The name of the alias to return data about
   * @returns {Promise<AliasConfiguration>}
   * @memberof LambdaTools
   */
  public async getAlias(
    reference: StackReference,
    Name: string
  ): Promise<AliasConfiguration> {
    const FunctionName = this.getLambdaName(reference);
    return await this.lambda.getAlias({ FunctionName, Name }).promise();
  }
}
