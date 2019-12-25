import { AwsConfig } from './common-interfaces';
import { Lambda, CloudWatchEvents } from 'aws-sdk';
import { StackReference } from './constants';

/**
 * Configuration options for the Lambda toolkit
 * @export
 * @interface LambdaConfig
 * @extends {AwsConfig}
 */
export interface LambdaConfig extends AwsConfig {
  lambdaNameA: string;
  lambdaNameB: string;
}

enum Operation {
  ENABLE,
  DISABLE,
}

export class LambdaTools {
  config: LambdaConfig;
  lambda: Lambda;
  events: CloudWatchEvents;

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
      ? `arn:aws:lambda:${this.config.awsRegion}:${this.config.awsProfile}:function:${this.config.lambdaNameA}`
      : `arn:aws:lambda:${this.config.awsRegion}:${this.config.awsProfile}:function:${this.config.lambdaNameB}`;
  }

  private async modifyRule(op: Operation, ref: StackReference): Promise<void> {
    const fn =
      op === Operation.ENABLE
        ? this.events.enableRule
        : this.events.disableRule;
    const TargetArn = this.getLambdaArn(ref);
    const { RuleNames = [] } = await this.events
      .listRuleNamesByTarget({ TargetArn })
      .promise();
    await Promise.all(
      RuleNames.map(async Name => {
        await fn({
          Name,
        }).promise();
      })
    );
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

  private async modifyEventMapping(
    op: Operation,
    ref: StackReference
  ): Promise<void> {
    const FunctionName = this.getLambdaName(ref);
    const { EventSourceMappings } = await this.lambda
      .listEventSourceMappings({
        FunctionName,
      })
      .promise();
    if (EventSourceMappings && EventSourceMappings.length > 0) {
      const Enabled = op === Operation.ENABLE;
      await Promise.all(
        EventSourceMappings.map(async ({ UUID }) => {
          if (UUID) {
            await this.lambda
              .updateEventSourceMapping({ UUID, Enabled })
              .promise();
          }
        })
      );
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
}
