import { PublishBatchCommand, PublishBatchCommandInput, SNSClient } from '@aws-sdk/client-sns';
import { NotifyType } from '../types';
import { randomUUID } from 'node:crypto';

const snsClient = new SNSClient({});

export interface ISnsAdapter {
    publishMessage({ notifications }: { notifications: NotifyType[] }): Promise<void>;
}

export class SnsAdapter implements ISnsAdapter {
    publishMessage = async ({ notifications }: { notifications: NotifyType[] }) => {
        const publishBatchCommandInput: PublishBatchCommandInput = {
            PublishBatchRequestEntries: notifications.map((item) => ({
                Id: randomUUID(),
                Message: JSON.stringify({
                    userId: item.userId,
                    message: item.message,
                    priority: item.priority,
                    title: item.title,
                }),
                MessageAttributes: {
                    priority: {
                        DataType: 'String',
                        StringValue: item.priority,
                    },
                },
            })),
            TopicArn: process.env.SNS_TOPIC_ARN,
        };

        const publishBatchCommand = new PublishBatchCommand(publishBatchCommandInput);
        await snsClient.send(publishBatchCommand);
    };
}
