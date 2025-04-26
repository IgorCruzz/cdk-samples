import { notifierSendService } from '../../services';
import * as foo from '../../shared/sns';
import { NotifyType } from '../../types';

describe('notifierSendService', () => {
    beforeAll(() => {
        jest.spyOn(foo, 'publishMessage').mockResolvedValue();
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

        const publishMessage = jest.spyOn(foo, 'publishMessage');

        await notifierSendService({ notifications });

        expect(publishMessage).toHaveBeenCalledWith({ notifications });
    });
});
