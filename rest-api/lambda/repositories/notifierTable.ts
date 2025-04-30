import { DynamoDBDocumentClient, PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { NotifyType } from '../types';
import { randomUUID } from 'node:crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const putItem = async (message: NotifyType) => {
    const PK = randomUUID();

    const params: PutCommandInput = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
            PK: `USER#`,
            SK: `NOTIFICATION#${PK}`,
            Message: message.message,
            Title: message.title,
            Timestamp: new Date().toISOString(),
        },
    };

    const command = new PutCommand(params);

    await docClient.send(command);
};
