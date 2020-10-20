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
  });
});
