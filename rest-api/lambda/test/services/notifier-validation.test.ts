import { notifierSendService } from '../../services';
import * as foo from '../../shared/sns';

jest.mock('../../shared/sns');

describe('notifierSendService', () => {
    it('should be defined', async () => {
        expect(notifierSendService).toBeDefined();
    });

    it('should be able to call publishMessage', async () => {
        const publishMessage = jest.spyOn(foo, 'publishMessage');

        await notifierSendService({
            notifications: [
                {
                    priority: 'HIGH',
                    userId: '28360287-9c42-4f14-971b-6e657bf030b5',
                    title: 'title',
                    message: 'message',
                },
            ],
        });

        expect(publishMessage).toHaveBeenCalledWith({
            notifications: [
                {
                    priority: 'HIGH',
                    userId: '28360287-9c42-4f14-971b-6e657bf030b5',
                    title: 'title',
                    message: 'message',
                },
            ],
        });
    });
});
