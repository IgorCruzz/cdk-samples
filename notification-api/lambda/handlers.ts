import { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda';
import { NotifierProcessDLQService, NotifierProcessService, NotifierSendService } from './services';
import { NotifyType } from './types';
import { TwilioAdapter, SesAdapter, SNSSAdapter } from './shared';

export const notifierProcessHandler = async (event: SQSEvent) => {
    const { Records } = event;

    const twilioAdapter = new TwilioAdapter();
    const sesAdapter = new SesAdapter();
    const notifierProcessService = new NotifierProcessService(twilioAdapter, sesAdapter);
    return await notifierProcessService.process({ records: Records });
};

export const notifierProcessDLQHandler = async (event: SQSEvent) => {
    const { Records } = event;

    const notifierProcessDLQService = new NotifierProcessDLQService();

    return await notifierProcessDLQService.process({ records: Records });
};

export const notifierSendHandler = async (event: APIGatewayProxyEvent) => {
    const body: { notifications: NotifyType[] } = JSON.parse(event.body || '');

    const snsAdapter = new SNSSAdapter();
    const notifierSendService = new NotifierSendService(snsAdapter);

    return await notifierSendService.send({ notifications: body.notifications });
};
