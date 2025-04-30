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
                service: 'WHATSAPP',
                title: 'title',
                message: 'message',
            },
        ];

        const publishMessage = jest.spyOn(sns, 'publishMessage');

        await notifierSendService({ notifications });

        expect(publishMessage).toHaveBeenCalledWith({ notifications });
    });

    it('should return a 200 status code and success message', async () => {
        const notifications: NotifyType[] = [
            {
                service: 'WHATSAPP',
                title: 'title',
                message: 'message',
            },
        ];

        const service = await notifierSendService({ notifications });

        expect(service).toEqual({
            statusCode: 200,
            body: JSON.stringify({
                message: 'Notifications sent successfully',
            }),
        });
    });

    it('should throw an error if publishMessage fails', async () => {
        const notifications: NotifyType[] = [
            {
                service: 'WHATSAPP',
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
