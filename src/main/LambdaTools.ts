import {
  CloudWatchClient,
  GetMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import {
  CloudWatchEventsClient,
  DisableRuleCommand,
  EnableRuleCommand,
  ListRuleNamesByTargetCommand,
} from '@aws-sdk/client-cloudwatch-events';
import {
  AliasConfiguration,
  CreateEventSourceMappingCommand,
  CreateEventSourceMappingRequest,
  DeleteEventSourceMappingCommand,
  EventSourceMappingConfiguration,
  GetAliasCommand,
  GetFunctionCommand,
  LambdaClient,
  ListEventSourceMappingsCommand,
  ListEventSourceMappingsRequest,
  UpdateEventSourceMappingCommand,
} from '@aws-sdk/client-lambda';

import { StackReference } from './constants.js';

import type { LambdaConfig, LatestLambdaMetricsMap } from './@types/index.js';

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

  lambda: LambdaClient;

  events: CloudWatchEventsClient;

  cloudwatch: CloudWatchClient;

  /**
   * Creates an instance of LambdaTools.
   * @param {LambdaConfig} config - Configuration options for the Lambda toolkit
   * @memberof LambdaTools
   */
  constructor(config: LambdaConfig) {
    this.config = config;
    this.lambda = new LambdaClient({ region: this.config.awsRegion });
    this.events = new CloudWatchEventsClient({ region: this.config.awsRegion });
    this.cloudwatch = new CloudWatchClient({ region: this.config.awsRegion });
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
          this.config.alias ? `:${this.config.alias}` : ''
        }`
      : `arn:aws:lambda:${this.config.awsRegion}:${
          this.config.awsProfile
        }:function:${this.config.lambdaNameB}${
          this.config.alias ? `:${this.config.alias}` : ''
        }`;
  }

  private async modifyRule(op: Operation, ref: StackReference): Promise<void> {
    const TargetArn = this.getLambdaArn(ref);
    const { RuleNames = [] } = await this.events.send(
      new ListRuleNamesByTargetCommand({ TargetArn })
    );
    for (const Name of RuleNames) {
      if (op === Operation.ENABLE) {
        await this.events.send(
          new EnableRuleCommand({
            Name,
          })
        );
      } else {
        await this.events.send(
          new DisableRuleCommand({
            Name,
          })
        );
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
  public createEventSourceMapping(
    reference: StackReference,
    eventSourceArn: string,
    sourceSpecificParams: Omit<
      CreateEventSourceMappingRequest,
      'FunctionName' | 'EventSourceArn'
    > = {}
  ): Promise<EventSourceMappingConfiguration> {
    return this.lambda.send(
      new CreateEventSourceMappingCommand({
        FunctionName: this.getLambdaArn(reference),
        EventSourceArn: eventSourceArn,
        ...sourceSpecificParams,
      })
    );
  }

  /**
   * Lists all event source mappings for the referenced function
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<EventSourceMappingsList>}
   * @memberof LambdaTools
   */
  public async listEventSourceMappings(
    reference: StackReference
  ): Promise<EventSourceMappingConfiguration[]> {
    const mappings = [];

    const params: ListEventSourceMappingsRequest = {
      FunctionName: this.getLambdaArn(reference),
    };
    do {
      const result = await this.lambda.send(
        new ListEventSourceMappingsCommand(params)
      );
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
        if (!UUID)
          throw new Error(
            `unable to fetch event source mapping information for stack ${ref}`
          );
        await this.lambda.send(
          new UpdateEventSourceMappingCommand({ UUID, Enabled })
        );
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
    await this.lambda.send(new DeleteEventSourceMappingCommand({ UUID }));
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
    const info = await this.lambda.send(
      new GetFunctionCommand({ FunctionName })
    );
    if (!info.Configuration?.Version)
      throw new Error(`unable to fetch lambda information for ${FunctionName}`);
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
  public getAlias(
    reference: StackReference,
    Name: string
  ): Promise<AliasConfiguration> {
    const FunctionName = this.getLambdaName(reference);
    return this.lambda.send(new GetAliasCommand({ FunctionName, Name }));
  }

  /**
   * Returns the latest metrics about a Lambda function alias.
   *
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<LatestLambdaMetricsMap>}
   * @memberof LambdaTools
   */
  public async getLatestMetrics(
    reference: StackReference
  ): Promise<LatestLambdaMetricsMap> {
    const functionName = this.getLambdaName(reference);

    const metricSet = [
      {
        metricName: 'IteratorAge',
        stat: 'Maximum',
      },
      {
        metricName: 'Errors',
        stat: 'Sum',
      },
      {
        metricName: 'ConcurrentExecutions',
        stat: 'Maximum',
      },
      {
        metricName: 'Invocations',
        stat: 'Sum',
      },
      {
        metricName: 'Duration',
        stat: 'Average',
      },
      {
        metricName: 'Throttles',
        stat: 'Sum',
      },
    ];

    const { MetricDataResults = [] } = await this.cloudwatch.send(
      new GetMetricDataCommand({
        StartTime: new Date(Date.now() - 300e3),
        EndTime: new Date(),
        MetricDataQueries: metricSet.map(({ metricName, stat }) => ({
          Id: metricName.toLowerCase(),
          MetricStat: {
            Metric: {
              Namespace: 'AWS/Lambda',
              MetricName: metricName,
              Dimensions: [
                {
                  Name: 'FunctionName',
                  Value: functionName,
                },
              ],
            },
            Period: 60,
            Stat: stat,
          },
        })),
      })
    );

    return MetricDataResults.reduce((acc, res) => {
      if (res.Label && res.Timestamps && res.Values) {
        return <LatestLambdaMetricsMap>{
          ...acc,
          [res.Label]: {
            latestMetricTimestamp: res.Timestamps[0],
            latestMetricValue: res.Values[0],
            stat: metricSet.find((m) => m.metricName === res.Label)?.stat,
          },
        };
      }
      return { ...acc };
    }, <LatestLambdaMetricsMap>{});
  }
}
