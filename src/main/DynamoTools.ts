import { DynamoDB } from 'aws-sdk';

import { DynamoConfig } from './@types';
import { StackReference } from './constants';

/**
 * Toolkit for Dynamo operations
 * @export
 * @class DynamoTools
 */
export class DynamoTools {
  config: DynamoConfig;
  dynamo: DynamoDB;

  /**
   * Creates an instance of DynamoTools.
   * @param {DynamoConfig} config - Configuration options for the Dynamo toolkit
   * @memberof DynamoTools
   */
  public constructor(config: DynamoConfig) {
    this.config = config;
    this.dynamo = new DynamoDB({ region: this.config.awsRegion });
  }

  protected getTableName(ref: StackReference): string {
    return ref === StackReference.a
      ? this.config.tableNameA
      : this.config.tableNameB;
  }

  /**
   * Deletes a dynamo table
   * @param {StackReference} reference - Reference to a active table
   * @returns {Promise<void>}
   * @memberof DynamoTools
   */
  public async deleteTable(reference: StackReference): Promise<void> {
    const TableName = this.getTableName(reference);
    await this.dynamo.deleteTable({ TableName }).promise();

    if (this.config.waitForTableDelete) {
      await this.dynamo.waitFor('tableNotExists', { TableName }).promise();
    }
  }
}
