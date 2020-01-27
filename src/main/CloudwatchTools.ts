import { CloudWatch } from 'aws-sdk';
import { AwsConfig } from './common-interfaces';
import { StackReference } from './constants';

/**
 * Configuration options for the CloudWatch toolkit
 * @export
 * @interface CloudWatchConfig
 * @extends {AwsConfig}
 */
export interface CloudWatchConfig extends AwsConfig {
  alarmStackA: AlarmIdentifiers;
  alarmStackB: AlarmIdentifiers;
}

interface AlarmIdentifiers {
  alarmPrefix: string;
  alarmSuffix?: string;
}

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
    const alarmNames = MetricAlarms.map(r => r.AlarmName);

    if (ref.alarmSuffix) {
      alarmNames.filter((r: string) => r.endsWith(ref.alarmSuffix));
    }
    return alarmNames;
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
