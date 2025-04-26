import { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda';
import { notifierProcessDLQService, notifierProcessService, notifierSendService } from './services';
import { NotifyType } from './types';

export const notifierProcessHandler = async (event: SQSEvent) => await notifierProcessService(event);

export const notifierProcessDLQHandler = async (event: SQSEvent) => await notifierProcessDLQService(event);

export const notifierSendHandler = async (event: APIGatewayProxyEvent) => {
    const body: { notifications: NotifyType[] } = JSON.parse(event.body || '');

    await notifierSendService({ notifications: body.notifications });
};
