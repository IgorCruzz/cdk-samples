import { NotifierSendService, NotifierSendServiceInterface } from '../../services';
import { NotifyType } from '../../types';
import { SNSSAdapterInterface } from '../../shared';

class SNSSAdapterStub implements SNSSAdapterInterface {
    publishMessage = async () => {
        return Promise.resolve();
    };
}

let notifierSendService: NotifierSendServiceInterface;
let snsAdapterStub: SNSSAdapterInterface;

describe('notifierSendService', () => {
    beforeAll(() => {
        snsAdapterStub = new SNSSAdapterStub();
        notifierSendService = new NotifierSendService(snsAdapterStub);
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

        const publishMessage = jest.spyOn(snsAdapterStub, 'publishMessage');

        await notifierSendService.send({ notifications });

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

        const service = await notifierSendService.send({ notifications });

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

        jest.spyOn(snsAdapterStub, 'publishMessage').mockRejectedValue(new Error('Error sending notification'));

        const service = await notifierSendService.send({ notifications });

        expect(service).toEqual({
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error',
            }),
        });
    });
});
