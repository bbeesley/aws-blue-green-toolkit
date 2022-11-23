import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import test from 'ava';

import { DynamoTools, StackReference } from '../../dist/esm/index.js';
import { awsMocks, resetMocks } from './mock-aws.js';

test.serial.beforeEach(() => {
  resetMocks();
});

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

test.serial(
  'DynamoTools > does not wait for table deletion to complete when config is false',
  async (t) => {
    config.waitForTableDelete = false;
    await dynamoTools.deleteTable(StackReference.b);
    t.deepEqual(awsMocks.mockDynamo.calls()[0].args[0].input, {
      TableName: config.tableNameB,
    });
    t.is(
      awsMocks.mockDynamo
        .calls()
        .find((c) => c.args[0] instanceof DescribeTableCommand),
      undefined
    );
  }
);

test.serial(
  'DynamoTools > waits for table deletion to complete when config is true',
  async (t) => {
    config.waitForTableDelete = true;
    await dynamoTools.deleteTable(StackReference.b);
    t.deepEqual(awsMocks.mockDynamo.calls()[0].args[0].input, {
      TableName: config.tableNameB,
    });
    t.snapshot(
      awsMocks.mockDynamo
        .calls()
        .find((c) => c.args[0] instanceof DescribeTableCommand)?.args[0].input
    );
  }
);

test.serial(
  'DynamoTools > calls deleteTable with expected params',
  async (t) => {
    await dynamoTools.deleteTable(StackReference.b);
    t.deepEqual(awsMocks.mockDynamo.calls()[0].args[0].input, {
      TableName: config.tableNameB,
    });
  }
);
