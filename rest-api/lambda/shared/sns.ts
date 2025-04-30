import { PublishBatchCommand, PublishBatchCommandInput, SNSClient } from '@aws-sdk/client-sns';
import { NotifyType } from '../types';
import { randomUUID } from 'node:crypto';

const snsClient = new SNSClient({});

export const publishMessage = async ({ notifications }: { notifications: NotifyType[] }) => {
    const publishBatchCommandInput: PublishBatchCommandInput = {
        PublishBatchRequestEntries: notifications.map((item) => ({
            Id: randomUUID(),
            Message: JSON.stringify({
                message: item.message,
                service: item.service,
                title: item.title,
            }),
            MessageAttributes: {
                priority: {
                    DataType: 'String',
                    StringValue: item.service,
                },
            },
        })),
        TopicArn: process.env.SNS_TOPIC_ARN,
    };

    const publishBatchCommand = new PublishBatchCommand(publishBatchCommandInput);
    await snsClient.send(publishBatchCommand);
};
