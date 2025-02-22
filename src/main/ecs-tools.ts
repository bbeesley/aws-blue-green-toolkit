import { ECSClient, UpdateServiceCommand } from '@aws-sdk/client-ecs';
import type { EcsConfig } from './@types/index.js';
import { StackReference } from './constants.js';

/**
 * Tools for managing pairs of ECS services
 *
 * @export
 * @class EcsTools
 */
export class EcsTools {
  ecs: ECSClient;

  /**
   * Creates an instance of EcsTools.
   *
   * @param {EcsConfig} config - Config describing the ecs service pair
   * @memberof EcsTools
   */
  public constructor(public config: EcsConfig) {
    this.ecs = new ECSClient({ region: this.config.awsRegion });
  }

  /**
   * Disables an ECS service by setting the desired task count to zero
   *
   * @param {StackReference} reference - The stack to modify
   * @returns {*}  {Promise<void>}
   * @memberof EcsTools
   */
  public async disableService(reference: StackReference): Promise<void> {
    await this.ecs.send(
      new UpdateServiceCommand({
        service:
          reference === StackReference.a
            ? this.config.serviceNameA
            : this.config.serviceNameB,
        cluster: this.config.cluster,
        desiredCount: 0,
      })
    );
  }

  /**
   * Enables an ECS service by setting the desired task count to it's normal value
   *
   * @param {StackReference} reference - The stack to modify
   * @returns {*}  {Promise<void>}
   * @memberof EcsTools
   */
  public async enableService(reference: StackReference): Promise<void> {
    await this.ecs.send(
      new UpdateServiceCommand({
        service:
          reference === StackReference.a
            ? this.config.serviceNameA
            : this.config.serviceNameB,
        cluster: this.config.cluster,
        desiredCount: this.config.desiredTasks,
      })
    );
  }
}
