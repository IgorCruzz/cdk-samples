import {
  PublishCommandInput,
  MessageAttributeValue,
  PublishBatchCommand,
  PublishBatchCommandInput,
  SNSClient,
  PublishCommand,
} from "@aws-sdk/client-sns";
import { randomUUID } from "node:crypto";

const snsClient = new SNSClient({});

export interface SnsInterface {
  publishBatchMessage: (params: {
    data: Record<string, unknown>[];
    attributes?: { dataType: string; stringValue: string }[];
  }) => Promise<void>;

  publishMessage: (params: {
    data: unknown;
    attributes?: { dataType: string; stringValue: string }[];
  }) => Promise<void>;
}

export const sns: SnsInterface = {
  async publishMessage({ data, attributes }) {
    const publishCommandInput: PublishCommandInput = {
      Message: JSON.stringify(data),
      TopicArn: process.env.SNS_DLQ_TOPIC_ARN,
      MessageAttributes: attributes?.reduce(
        (acc, { dataType, stringValue }) => {
          acc[dataType] = {
            DataType: dataType,
            StringValue: stringValue,
          };
          return acc;
        },
        {} as Record<string, MessageAttributeValue>
      ),
    };

    const publishCommand = new PublishCommand(publishCommandInput);
    await snsClient.send(publishCommand);
  },

  async publishBatchMessage({ data, attributes }) {
    const publishBatchCommandInput: PublishBatchCommandInput = {
      PublishBatchRequestEntries: data.map((item) => ({
        Id: randomUUID(),
        Message: JSON.stringify(item),
        MessageAttributes:
          attributes &&
          attributes.reduce((acc, { dataType, stringValue }) => {
            acc[stringValue] = {
              DataType: dataType,
              StringValue: item[stringValue] as string,
            };
            return acc;
          }, {} as Record<string, MessageAttributeValue>),
      })),
      TopicArn: process.env.SNS_TOPIC_ARN,
    };

    const publishBatchCommand = new PublishBatchCommand(
      publishBatchCommandInput
    );
    await snsClient.send(publishBatchCommand);
  },
};
