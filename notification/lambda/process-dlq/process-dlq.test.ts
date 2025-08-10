import { service } from "../process-dlq/process-dlq.service";
import { sns } from "../_shared/infra/sns";

jest.mock("../_shared/infra/sns", () => ({
  sns: {
    publishMessage: jest.fn().mockResolvedValue(undefined),
    publishBatchMessage: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("processDLQ", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be to call publishMessage", async () => {
    await service({
      records: [
        {
          messageId: "1",
          receiptHandle: "receipt-handle-1",
          body: JSON.stringify({ key: "value1" }),
          attributes: {
            ApproximateReceiveCount: "1",
            SentTimestamp: "1234567890",
            SenderId: "sender-1",
            ApproximateFirstReceiveTimestamp: "1234567890",
          },
          messageAttributes: {},
          md5OfBody: "md5-body-1",
          eventSource: "aws:sqs",
          eventSourceARN: "arn:aws:sqs:region:account-id:queue-name",
          awsRegion: "us-east-1",
        },
        {
          messageId: "2",
          receiptHandle: "receipt-handle-2",
          body: JSON.stringify({ key: "value2" }),
          attributes: {
            ApproximateReceiveCount: "2",
            SentTimestamp: "1234567891",
            SenderId: "sender-2",
            ApproximateFirstReceiveTimestamp: "1234567891",
          },
          messageAttributes: {},
          md5OfBody: "md5-body-2",
          eventSource: "aws:sqs",
          eventSourceARN: "arn:aws:sqs:region:account-id:queue-name",
          awsRegion: "us-east-1",
        },
      ],
    });

    expect(sns.publishMessage).toHaveBeenCalledWith({
      data: {
        key: "value1",
      },
    });
  });
});
