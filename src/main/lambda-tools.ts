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
  type AliasConfiguration,
  CreateEventSourceMappingCommand,
  type CreateEventSourceMappingRequest,
  DeleteEventSourceMappingCommand,
  type EventSourceMappingConfiguration,
  GetAliasCommand,
  GetFunctionCommand,
  LambdaClient,
  ListEventSourceMappingsCommand,
  type ListEventSourceMappingsRequest,
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
 *
 * @export
 * @class LambdaTools
 */
export class LambdaTools {
  public cloudwatch: CloudWatchClient;
  public events: CloudWatchEventsClient;
  public lambda: LambdaClient;

  /**
   * Creates an instance of LambdaTools.
   *
   * @param {LambdaConfig} config - Configuration options for the Lambda toolkit
   * @memberof LambdaTools
   */
  constructor(public config: LambdaConfig) {
    this.lambda = new LambdaClient({ region: this.config.awsRegion });
    this.events = new CloudWatchEventsClient({ region: this.config.awsRegion });
    this.cloudwatch = new CloudWatchClient({ region: this.config.awsRegion });
  }

  /**
   * Creates a lambda's event source mapping (eg, a Kinesis stream)
   *
   * @param {StackReference} reference - Reference to a lambda stack
   * @param {string} eventSourceArn - The ARN of the event source
   * @param {(Omit<
   *       CreateEventSourceMappingRequest,
   *       'FunctionName' | 'EventSourceArn'
   *     >)} [sourceSpecificParams={}] - Any params specific to the event source
   * @returns {*}  {Promise<EventSourceMappingConfiguration>}
   * @memberof LambdaTools
   */
  public async createEventSourceMapping(
    reference: StackReference,
    eventSourceArn: string,
    sourceSpecificParameters: Omit<
      CreateEventSourceMappingRequest,
      'FunctionName' | 'EventSourceArn'
    > = {}
  ): Promise<EventSourceMappingConfiguration> {
    return this.lambda.send(
      new CreateEventSourceMappingCommand({
        FunctionName: this.getLambdaArn(reference),
        EventSourceArn: eventSourceArn,
        ...sourceSpecificParameters,
      })
    );
  }

  /**
   * Deletes a lambda's event mapping (eg, a Kinesis stream)
   * You may use the `listEventSourceMappings` method if you
   * need to retrieve UUIDs of the function event sources
   *
   * @param {StackReference} UUID - The identifier of the event source mapping
   * @returns {Promise<void>}
   * @memberof LambdaTools
   */
  public async deleteEventMapping(UUID: string): Promise<void> {
    await this.lambda.send(new DeleteEventSourceMappingCommand({ UUID }));
  }

  /**
   * Disables a lambda's event mappings (eg, an SQS subscription)
   *
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<void>}
   * @memberof LambdaTools
   */
  public async disableEventMapping(reference: StackReference): Promise<void> {
    await this.modifyEventMapping(Operation.DISABLE, reference);
  }

  /**
   * Disables a lambda's cloudwatch events rule (ie, cron trigger)
   *
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<void>}
   * @memberof LambdaTools
   */
  public async disableRule(reference: StackReference): Promise<void> {
    await this.modifyRule(Operation.DISABLE, reference);
  }

  /**
   * Enables a lambda's event mappings (eg, an SQS subscription)
   *
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<void>}
   * @memberof LambdaTools
   */
  public async enableEventMapping(reference: StackReference): Promise<void> {
    await this.modifyEventMapping(Operation.ENABLE, reference);
  }

  /**
   * Enables a lambda's cloudwatch events rule (ie, cron trigger)
   *
   * @param {StackReference} reference - Reference to a lambda stack
   * @returns {Promise<void>}
   * @memberof LambdaTools
   */
  public async enableRule(reference: StackReference): Promise<void> {
    await this.modifyRule(Operation.ENABLE, reference);
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

    return MetricDataResults.reduce<LatestLambdaMetricsMap>(
      (accumulator, result) => {
        if (result.Label && result.Timestamps && result.Values) {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const item = {
            ...accumulator,
            [result.Label]: {
              latestMetricTimestamp: result.Timestamps[0],
              latestMetricValue: result.Values[0],
              stat: metricSet.find((m) => m.metricName === result.Label)?.stat,
            },
          } as LatestLambdaMetricsMap;
          return item;
        }

        return { ...accumulator };
      },
      {}
    );
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
   * Lists all event source mappings for the referenced function
   *
   * @param {StackReference} reference -- Reference to a lambda stack
   * @returns {*}  {Promise<EventSourceMappingConfiguration[]>}
   * @memberof LambdaTools
   */
  public async listEventSourceMappings(
    reference: StackReference
  ): Promise<EventSourceMappingConfiguration[]> {
    const mappings = [];

    const parameters: ListEventSourceMappingsRequest = {
      FunctionName: this.getLambdaArn(reference),
    };
    do {
      const result = await this.lambda.send(
        new ListEventSourceMappingsCommand(parameters)
      );
      if (result.EventSourceMappings)
        mappings.push(...result.EventSourceMappings);

      if (result.NextMarker) parameters.Marker = result.NextMarker;
    } while (parameters.Marker);

    return mappings;
  }

  private getLambdaArn(reference: StackReference): string {
    return reference === StackReference.a
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

  private getLambdaName(reference: StackReference): string {
    return reference === StackReference.a
      ? this.config.lambdaNameA
      : this.config.lambdaNameB;
  }

  private async modifyEventMapping(
    op: Operation,
    reference: StackReference
  ): Promise<void> {
    const eventSourceMappings = await this.listEventSourceMappings(reference);
    if (eventSourceMappings.length > 0) {
      const Enabled = op === Operation.ENABLE;
      for (const mapping of eventSourceMappings) {
        const { UUID } = mapping;
        if (!UUID)
          throw new Error(
            `unable to fetch event source mapping information for stack ${reference}`
          );
        await this.lambda.send(
          new UpdateEventSourceMappingCommand({ UUID, Enabled })
        );
      }
    }
  }

  private async modifyRule(
    op: Operation,
    reference: StackReference
  ): Promise<void> {
    const TargetArn = this.getLambdaArn(reference);
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
}
