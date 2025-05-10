import { MessageAttributeValue, PublishBatchCommand, PublishBatchCommandInput, SNSClient } from '@aws-sdk/client-sns';
import { randomUUID } from 'node:crypto';

const snsClient = new SNSClient({});

export interface SNSSAdapterInterface {
    publishBatchMessage: (params: {
        data: unknown[];
        attributes?: { dataType: string; stringValue: string }[];
    }) => Promise<void>;
}

export class SNSSAdapter implements SNSSAdapterInterface {
    publishBatchMessage = async ({
        data,
        attributes,
    }: {
        data: unknown[];
        attributes?: { dataType: string; stringValue: string }[];
    }) => {
        const publishBatchCommandInput: PublishBatchCommandInput = {
            PublishBatchRequestEntries: data.map((item) => ({
                Id: randomUUID(),
                Message: JSON.stringify(item),
                MessageAttributes: attributes?.reduce((acc, { dataType, stringValue }) => {
                    acc[dataType] = {
                        DataType: dataType,
                        StringValue: stringValue,
                    };
                    return acc;
                }, {} as Record<string, MessageAttributeValue>),
            })),
            TopicArn: process.env.SNS_TOPIC_ARN,
        };

        const publishBatchCommand = new PublishBatchCommand(publishBatchCommandInput);
        await snsClient.send(publishBatchCommand);
    };
}
