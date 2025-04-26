import { notifierSendController } from '../../controllers';
import * as service from '../../services/notifier-send.service';
import { NotifyType } from '../../types';

describe('notifierSendController', () => {
    beforeAll(() => {
        jest.spyOn(service, 'notifierSendService').mockResolvedValue({
            statusCode: 200,
            body: JSON.stringify({
                message: 'success',
            }),
        });
    });

    it('should be defined', async () => {
        expect(notifierSendController).toBeDefined();
    });

    it('should be able to call notifierProcessService', async () => {
        const notifications: NotifyType[] = [
            {
                message: 'message',
                priority: 'HIGH',
                title: 'title',
                userId: 'userId',
            },
        ];

        await notifierSendController({ notifications });
    });
});
