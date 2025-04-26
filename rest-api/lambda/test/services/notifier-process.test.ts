import { notifierProcessService } from '../../services';
import { notifierTable } from '../../repositories';
import { SQSRecord } from 'aws-lambda';

describe('notifierProcessService', () => {
    beforeEach(() => {
        jest.spyOn(notifierTable, 'putItem').mockResolvedValue();
    });

    it('should be defined', async () => {
        expect(notifierProcessService).toBeDefined();
    });

    it('should be able to call putItem', async () => {
        const records: SQSRecord[] = [
            {
                messageId: '059f36b4-87a3-44ab-83d2-661975830a7d',
                receiptHandle: 'AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...',
                body: JSON.stringify({
                    message: 'message',
                    priority: 'HIGH',
                    title: 'title',
                    userId: 'userId',
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

        await notifierProcessService({ records });
    });

    it('should return empty batchItemFailures when all records are processed successfully', async () => {
        const records: SQSRecord[] = [
            {
                messageId: '059f36b4-87a3-44ab-83d2-661975830a7d',
                receiptHandle: 'AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...',
                body: JSON.stringify({
                    message: 'message',
                    priority: 'HIGH',
                    title: 'title',
                    userId: 'userId',
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
});
