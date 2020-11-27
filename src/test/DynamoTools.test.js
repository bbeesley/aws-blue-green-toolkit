import { DynamoTools, StackReference } from '../main';
import * as AWS from 'aws-sdk';

const config = {
  awsRegion: 'eu-central-1',
  awsProfile: '555',
  environment: 'dev',
  namespace: 'fn',
  tags: {},
  tableNameA: 'table-a-dev',
  tableNameB: 'table-b-dev',
};

const dynamoTools = new DynamoTools(config);

describe('DynamoTools', () => {
  describe('deleteTable', () => {
    it('calls deleteTable with expected params', async () => {
      await dynamoTools.deleteTable(StackReference.b);
      expect(AWS.DynamoDB._deleteTable).toHaveBeenCalledWith({
        TableName: config.tableNameB,
      });
    });
    it('waits for table deletion to complete when config is true', async () => {
      config.waitForTableDelete = true;
      await dynamoTools.deleteTable(StackReference.b);
      expect(AWS.DynamoDB._deleteTable).toHaveBeenCalledWith({
        TableName: config.tableNameB,
      });
      expect(AWS.DynamoDB._waitFor).toHaveBeenCalledWith('tableNotExists', {
        TableName: config.tableNameB,
      });
    });
    it('does not wait for table deletion to complete when config is false', async () => {
      config.waitForTableDelete = false;
      await dynamoTools.deleteTable(StackReference.b);
      expect(AWS.DynamoDB._deleteTable).toHaveBeenCalledWith({
        TableName: config.tableNameB,
      });
      expect(AWS.DynamoDB._waitFor).not.toHaveBeenCalled();
    });
  });
});
