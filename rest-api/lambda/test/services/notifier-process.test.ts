import { INotifierRepository } from '../../repositories';
import { NotifierProcessService } from '../../services';

class NotifierRepositoryStub implements INotifierRepository {
    putItem = async () => {
        Promise.resolve();
    };
}

let notifierProcessService: NotifierProcessService;
let notifierRepositoryStub: NotifierRepositoryStub;

const sqsRecord = {
    messageId: '12345-abcde',
    receiptHandle: 'AQEBKyxE...',
    body: '{"message": "message", "priority": 1, "userId": "user123", "title": "title"}',
    attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1614628520000',
        SenderId: 'AIDAIEN6KCDGH3FJUHZ2A',
        ApproximateFirstReceiveTimestamp: '1614628521000',
    },
    messageAttributes: {},
    md5OfBody: 'ed079d39be2d7fa77d31430f332cb321',
    eventSource: 'aws:sqs',
    eventSourceARN: 'arn:aws:sqs:us-west-2:123456789012:my-queue',
    awsRegion: 'us-west-2',
};

describe('NotifierProcessService', () => {
    beforeAll(() => {
        notifierRepositoryStub = new NotifierRepositoryStub();
        notifierProcessService = new NotifierProcessService(notifierRepositoryStub);
    });

    it('should be defined', async () => {
        expect(notifierProcessService).toBeDefined();
    });

    it('should be able to call putItem', async () => {
        const putItemSpy = jest.spyOn(notifierRepositoryStub, 'putItem');

        await notifierProcessService.process(sqsRecord);

        expect(putItemSpy).toHaveBeenCalled();

        expect(putItemSpy).toHaveBeenCalledWith({
            message: 'message',
            priority: 1,
            userId: 'user123',
            title: 'title',
        });
    });

    it('should be able to log the success message', async () => {
        const logSpy = jest.spyOn(console, 'log');

        await notifierProcessService.process(sqsRecord);

        expect(logSpy).toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledWith('Notificação salva com sucesso!!!');
    });
});
