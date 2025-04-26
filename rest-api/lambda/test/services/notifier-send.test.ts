import { notifierSendService } from '../../services';
import * as sns from '../../shared/sns';
import { NotifyType } from '../../types';

describe('notifierSendService', () => {
    beforeAll(() => {
        jest.spyOn(sns, 'publishMessage').mockResolvedValue();
    });

    it('should be defined', async () => {
        expect(notifierSendService).toBeDefined();
    });

    it('should be able to call publishMessage', async () => {
        const notifications: NotifyType[] = [
            {
                priority: 'HIGH',
                userId: '28360287-9c42-4f14-971b-6e657bf030b5',
                title: 'title',
                message: 'message',
            },
        ];

        const publishMessage = jest.spyOn(sns, 'publishMessage');

        await notifierSendService({ notifications });

        expect(publishMessage).toHaveBeenCalledWith({ notifications });
    });

    it('should throw an error if publishMessage fails', async () => {
        const notifications: NotifyType[] = [
            {
                priority: 'HIGH',
                userId: '28360287-9c42-4f14-971b-6e657bf030b5',
                title: 'title',
                message: 'message',
            },
        ];

        jest.spyOn(sns, 'publishMessage').mockRejectedValue(new Error('Error sending notification'));

        const service = await notifierSendService({ notifications });

        expect(service).toEqual({
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error',
            }),
        });
    });
});
