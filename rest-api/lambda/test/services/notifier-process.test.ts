import { notifierProcessService } from '../../services';
import { notifierTable } from '../../repositories';
import { NotifyType } from '../../types';

describe('notifierProcessService', () => {
    beforeAll(() => {
        jest.spyOn(notifierTable, 'putItem').mockResolvedValue();
    });

    it('should be defined', async () => {
        expect(notifierProcessService).toBeDefined();
    });

    it('should be able to call putItem', async () => {
        const notification: NotifyType = {
            message: 'message',
            priority: 'HIGH',
            title: 'title',
            userId: 'userId',
        };

        const notifierTableMock = jest.spyOn(notifierTable, 'putItem');

        await notifierProcessService({ notification });

        expect(notifierTableMock).toHaveBeenCalledWith(notification);
    });
});
