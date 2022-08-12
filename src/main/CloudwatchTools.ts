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
 * @export
 * @class CloudWatchTools
 */
export class CloudWatchTools {
  config: CloudWatchConfig;

  cloudWatch: CloudWatchClient;

  /**
   * Creates an instance of CloudWatchTools.
   * @param {CloudWatchConfig} config
   * @memberof CloudWatchConfig
   */
  constructor(config: CloudWatchConfig) {
    this.config = config;
    this.cloudWatch = new CloudWatchClient({ region: this.config.awsRegion });
  }

  private getAlarmIdentifiers(ref: StackReference): AlarmIdentifiers {
    return ref === StackReference.a
      ? this.config.alarmStackA
      : this.config.alarmStackB;
  }

  private async getAlarms(ref: AlarmIdentifiers): Promise<Array<string>> {
    const { MetricAlarms } = await this.cloudWatch.send(
      new DescribeAlarmsCommand({
        AlarmNamePrefix: ref.alarmPrefix,
      })
    );
    let alarms = MetricAlarms;
    if (!MetricAlarms)
      throw new Error(`unable to fetch cloudwatch metric alarms for ${ref}`);
    const { alarmSuffix } = ref;
    if (alarmSuffix) {
      alarms = MetricAlarms.filter((r) => r.AlarmName?.endsWith(alarmSuffix));
    }
    return alarms?.map((r) => r.AlarmName).filter((a) => !!a) as string[];
  }

  /**
   * Disable all alarm actions
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
   * @param {StackReference} reference - Reference to a subscription queue stack
   * @returns {Promise<void>}
   */
  public async enableAlarmsActions(reference: StackReference): Promise<void> {
    const alarms = await this.getAlarms(this.getAlarmIdentifiers(reference));
    await this.cloudWatch.send(
      new EnableAlarmActionsCommand({ AlarmNames: alarms })
    );
  }
}
