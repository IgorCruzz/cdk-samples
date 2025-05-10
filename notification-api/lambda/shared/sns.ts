import {
    PublishCommandInput,
    MessageAttributeValue,
    PublishBatchCommand,
    PublishBatchCommandInput,
    SNSClient,
    PublishCommand,
} from '@aws-sdk/client-sns';
import { randomUUID } from 'node:crypto';

const snsClient = new SNSClient({});

export interface SNSSAdapterInterface {
    publishBatchMessage: (params: {
        data: unknown[];
        attributes?: { dataType: string; stringValue: string }[];
    }) => Promise<void>;

    publishMessage: (params: {
        data: unknown;
        attributes?: { dataType: string; stringValue: string }[];
    }) => Promise<void>;
}

export class SNSSAdapter implements SNSSAdapterInterface {
    publishMessage = async (params: { data: unknown; attributes?: { dataType: string; stringValue: string }[] }) => {
        const publishCommandInput: PublishCommandInput = {
            Message: JSON.stringify(params.data),
            TopicArn: process.env.SNS_TOPIC_ARN,
            MessageAttributes: params.attributes?.reduce((acc, { dataType, stringValue }) => {
                acc[dataType] = {
                    DataType: dataType,
                    StringValue: stringValue,
                };
                return acc;
            }, {} as Record<string, MessageAttributeValue>),
        };

        const publishCommand = new PublishCommand(publishCommandInput);
        await snsClient.send(publishCommand);
    };

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
