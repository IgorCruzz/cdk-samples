import { PublishBatchCommand, PublishBatchCommandInput, SNSClient } from '@aws-sdk/client-sns';
import { NotifyType } from '../types';
import { randomUUID } from 'node:crypto';

const snsClient = new SNSClient({});

export const NotifyRepository = {
    publishMessage: async (data: NotifyType[]) => {
        const publishBatchCommandInput: PublishBatchCommandInput = {
            PublishBatchRequestEntries: data.map((item) => ({
                Id: randomUUID(),
                Message: JSON.stringify({
                    userId: item.userId,
                    message: item.message,
                    priority: item.priority,
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
    },
};
