import { CloudWatch } from 'aws-sdk';
import { AlarmIdentifiers, CloudWatchConfig } from './@types';
import { StackReference } from './constants';

/**
 * Toolkit for CloudWatch operations
 * @export
 * @class CloudWatchTools
 */
export class CloudWatchTools {
  config: CloudWatchConfig;

  cloudWatch: CloudWatch;

  /**
   * Creates an instance of CloudWatchTools.
   * @param {CloudWatchConfig} config
   * @memberof CloudWatchConfig
   */
  constructor(config: CloudWatchConfig) {
    this.config = config;
    this.cloudWatch = new CloudWatch({ region: this.config.awsRegion });
  }

  private getAlarmIdentifiers(ref: StackReference): AlarmIdentifiers {
    return ref === StackReference.a
      ? this.config.alarmStackA
      : this.config.alarmStackB;
  }

  private async getAlarms(ref: AlarmIdentifiers): Promise<Array<string>> {
    const { MetricAlarms } = await this.cloudWatch
      .describeAlarms({
        AlarmNamePrefix: ref.alarmPrefix,
      })
      .promise();
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
    await this.cloudWatch.disableAlarmActions({ AlarmNames: alarms }).promise();
  }

  /**
   * Enable all alarm actions
   * @param {StackReference} reference - Reference to a subscription queue stack
   * @returns {Promise<void>}
   */
  public async enableAlarmsActions(reference: StackReference): Promise<void> {
    const alarms = await this.getAlarms(this.getAlarmIdentifiers(reference));
    await this.cloudWatch.enableAlarmActions({ AlarmNames: alarms }).promise();
  }
}
