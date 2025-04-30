import { notifierProcessService } from '../../services';
import { SQSRecord } from 'aws-lambda';
import * as twilio from '../../shared/twilio';

describe('notifierProcessService', () => {
    beforeEach(() => {
        jest.spyOn(twilio, 'sendWhatsAppMessage').mockImplementation();
    });

    it('should be defined', async () => {
        expect(notifierProcessService).toBeDefined();
    });

    it('should be able to call sendWhatsAppMessage when service is WHATSAPP', async () => {
        const records: SQSRecord[] = [
            {
                messageId: '059f36b4-87a3-44ab-83d2-661975830a7d',
                receiptHandle: 'AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...',
                body: JSON.stringify({
                    message: 'message',
                    service: 'WHATSAPP',
                    title: 'title',
                }),
                attributes: {
                    ApproximateReceiveCount: '1',
                    SentTimestamp: '1545082649183',
                    SenderId: 'AIDAIENQZJOLO23YVJ4VO',
                    ApproximateFirstReceiveTimestamp: '1545082649185',
                },
                messageAttributes: {
                    myAttribute: {
                        stringValue: 'myValue',
                        stringListValues: [],
                        binaryListValues: [],
                        dataType: 'String',
                    },
                },
                md5OfBody: 'e4e68fb7bd0e697a0ae8f1bb342846b3',
                eventSource: 'aws:sqs',
                eventSourceARN: 'arn:aws:sqs:us-east-2:123456789012:my-queue',
                awsRegion: 'us-east-2',
            },
        ];

        const sendWhatsAppMessage = jest.spyOn(twilio, 'sendWhatsAppMessage');

        await notifierProcessService({ records });

        expect(sendWhatsAppMessage).toHaveBeenCalled();
        expect(sendWhatsAppMessage).toHaveBeenCalledWith({
            message: 'message',
        });
    });

    it('should return empty batchItemFailures when all records are processed successfully', async () => {
        const records: SQSRecord[] = [
            {
                messageId: '059f36b4-87a3-44ab-83d2-661975830a7d',
                receiptHandle: 'AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...',
                body: JSON.stringify({
                    message: 'message',
                    service: 'WHATSAPP',
                    title: 'title',
                }),
                attributes: {
                    ApproximateReceiveCount: '1',
                    SentTimestamp: '1545082649183',
                    SenderId: 'AIDAIENQZJOLO23YVJ4VO',
                    ApproximateFirstReceiveTimestamp: '1545082649185',
                },
                messageAttributes: {
                    myAttribute: {
                        stringValue: 'myValue',
                        stringListValues: [],
                        binaryListValues: [],
                        dataType: 'String',
                    },
                },
                md5OfBody: 'e4e68fb7bd0e697a0ae8f1bb342846b3',
                eventSource: 'aws:sqs',
                eventSourceARN: 'arn:aws:sqs:us-east-2:123456789012:my-queue',
                awsRegion: 'us-east-2',
            },
        ];

        const service = await notifierProcessService({ records });

        expect(service).toEqual({
            batchItemFailures: [],
        });
    });

    it('should return batchItemFailures when there is an error processing a record', async () => {
        jest.spyOn(twilio, 'sendWhatsAppMessage').mockRejectedValue(new Error('Error processing item'));

        const records: SQSRecord[] = [
            {
                messageId: '059f36b4-87a3-44ab-83d2-661975830a7d',
                receiptHandle: 'AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...',
                body: JSON.stringify({
                    message: 'message',
                    service: 'WHATSAPP',
                    title: 'title',
                }),
                attributes: {
                    ApproximateReceiveCount: '1',
                    SentTimestamp: '1545082649183',
                    SenderId: 'AIDAIENQZJOLO23YVJ4VO',
                    ApproximateFirstReceiveTimestamp: '1545082649185',
                },
                messageAttributes: {
                    myAttribute: {
                        stringValue: 'myValue',
                        stringListValues: [],
                        binaryListValues: [],
                        dataType: 'String',
                    },
                },
                md5OfBody: 'e4e68fb7bd0e697a0ae8f1bb342846b3',
                eventSource: 'aws:sqs',
                eventSourceARN: 'arn:aws:sqs:us-east-2:123456789012:my-queue',
                awsRegion: 'us-east-2',
            },
        ];

        const service = await notifierProcessService({ records });

        expect(service).toEqual({
            batchItemFailures: [
                {
                    itemIdentifier: '059f36b4-87a3-44ab-83d2-661975830a7d',
                },
            ],
        });
    });
});
