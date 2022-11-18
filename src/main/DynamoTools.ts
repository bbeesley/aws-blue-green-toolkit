import {
  DeleteTableCommand,
  DynamoDBClient,
  waitUntilTableNotExists,
} from '@aws-sdk/client-dynamodb';

import { StackReference } from './constants.js';

import type { DynamoConfig } from './@types/index.js';
/**
 * Toolkit for Dynamo operations
 *
 * @export
 * @class DynamoTools
 */
export class DynamoTools {
  config: DynamoConfig;

  dynamo: DynamoDBClient;

  /**
   * Creates an instance of DynamoTools.
   *
   * @param {DynamoConfig} config - Configuration options for the Dynamo toolkit
   * @memberof DynamoTools
   */
  public constructor(config: DynamoConfig) {
    this.config = config;
    this.dynamo = new DynamoDBClient({ region: this.config.awsRegion });
  }

  protected getTableName(ref: StackReference): string {
    return ref === StackReference.a
      ? this.config.tableNameA
      : this.config.tableNameB;
  }

  /**
   * Deletes a dynamo table
   *
   * @param {StackReference} reference - Reference to a active table
   * @returns {Promise<void>}
   * @memberof DynamoTools
   */
  public async deleteTable(reference: StackReference): Promise<void> {
    const TableName = this.getTableName(reference);
    await this.dynamo.send(new DeleteTableCommand({ TableName }));

    if (this.config.waitForTableDelete) {
      await waitUntilTableNotExists(
        {
          client: this.dynamo,
          maxWaitTime: 300,
        },
        { TableName }
      );
    }
  }
}
