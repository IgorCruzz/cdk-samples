import { SQSRecord } from 'aws-lambda';
import { NotifierProcessDLQService, NotifierProcessDLQServiceInterface } from '../../services';
import { SNSSAdapterInterface } from '../../shared';
import { SNSSAdapterStub } from '../stub/shared';

let notifierProcessDLQService: NotifierProcessDLQServiceInterface;
let snsAdapterStub: SNSSAdapterInterface;

describe('Notifier Process DLQ', () => {
    beforeAll(() => {
        snsAdapterStub = new SNSSAdapterStub();
        notifierProcessDLQService = new NotifierProcessDLQService(snsAdapterStub);
    });

    it('should be defined', () => {
        expect(notifierProcessDLQService).toBeDefined();
    });

    it('should be able to send message to sendMessage', async () => {
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

        const snsAdapter = jest.spyOn(snsAdapterStub, 'publishMessage');

        await notifierProcessDLQService.process({ records });

        expect(snsAdapter).toHaveBeenCalled();
        expect(snsAdapter).toHaveBeenCalledWith({
            data: {
                message: 'message',
                service: 'WHATSAPP',
                title: 'title',
            },
        });
    });
});
