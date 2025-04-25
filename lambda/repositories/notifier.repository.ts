import { DynamoDBDocumentClient, PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { NotifyType } from '../types';
import { randomUUID } from 'node:crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export interface INotifierRepository {
    putItem(message: NotifyType): Promise<void>;
}

export class NotifierRepository implements INotifierRepository {
    putItem = async (message: NotifyType) => {
        const PK = randomUUID();

        const params: PutCommandInput = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: {
                PK: `USER#${message.userId}`,
                SK: `NOTIFICATION#${PK}`,
                UserId: message.userId,
                Message: message.message,
                Priority: message.priority,
                Title: message.title,
                Timestamp: new Date().toISOString(),
                GSI1PK: message.priority,
                GSI1SK: `USER#${message.userId}`,
            },
        };

        const command = new PutCommand(params);

        await docClient.send(command);
    };
}
