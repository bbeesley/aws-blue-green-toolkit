import {
  CloudWatchClient,
  DescribeAlarmsCommand,
  DisableAlarmActionsCommand,
  EnableAlarmActionsCommand,
} from '@aws-sdk/client-cloudwatch';
import type { AlarmIdentifiers, CloudWatchConfig } from './@types/index.js';
import { StackReference } from './constants.js';

/**
 * Toolkit for CloudWatch operations
 *
 * @export
 * @class CloudWatchTools
 */
export class CloudWatchTools {
  public cloudWatch: CloudWatchClient;

  /**
   * Creates an instance of CloudWatchTools.
   *
   * @param {CloudWatchConfig} config - Config describing the alarm pair
   * @memberof CloudWatchConfig
   */
  constructor(public config: CloudWatchConfig) {
    this.config = config;
    this.cloudWatch = new CloudWatchClient({ region: this.config.awsRegion });
  }

  /**
   * Disable all alarm actions
   *
   * @param {StackReference} reference - Reference to a subscription queue stack
   * @returns {Promise<void>}
   */
  public async disableAlarmsActions(reference: StackReference): Promise<void> {
    const alarms = await this.getAlarms(this.getAlarmIdentifiers(reference));
    await this.cloudWatch.send(
      new DisableAlarmActionsCommand({ AlarmNames: alarms })
    );
  }

  /**
   * Enable all alarm actions
   *
   * @param {StackReference} reference - Reference to a subscription queue stack
   * @returns {Promise<void>}
   */
  public async enableAlarmsActions(reference: StackReference): Promise<void> {
    const alarms = await this.getAlarms(this.getAlarmIdentifiers(reference));
    await this.cloudWatch.send(
      new EnableAlarmActionsCommand({ AlarmNames: alarms })
    );
  }

  private getAlarmIdentifiers(ref: StackReference): AlarmIdentifiers {
    return ref === StackReference.a
      ? this.config.alarmStackA
      : this.config.alarmStackB;
  }

  private async getAlarms(ref: AlarmIdentifiers): Promise<string[]> {
    const { MetricAlarms } = await this.cloudWatch.send(
      new DescribeAlarmsCommand({
        AlarmNamePrefix: ref.alarmPrefix,
      })
    );
    let alarms = MetricAlarms;
    if (!MetricAlarms)
      throw new Error(
        `unable to fetch cloudwatch metric alarms for ${JSON.stringify(ref)}`
      );
    const { alarmSuffix } = ref;
    if (alarmSuffix) {
      alarms = MetricAlarms.filter((r) => r.AlarmName?.endsWith(alarmSuffix));
    }

    return alarms?.map((r) => r.AlarmName).filter(Boolean) as string[];
  }
}
