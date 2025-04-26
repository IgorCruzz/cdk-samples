import { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda';
import { notifierProcessController, notifierProcessDLQController, notifierSendController } from '../controllers';
import { NotifyType } from '../types';

export const notifierProcessHandler = async (event: SQSEvent) => await notifierProcessController(event);

export const notifierProcessDLQHandler = async (event: SQSEvent) => await notifierProcessDLQController(event);

export const notifierSendHandler = async (event: APIGatewayProxyEvent) => {
    const body: { notifications: NotifyType[] } = JSON.parse(event.body || '');

    await notifierSendController({ notifications: body.notifications });
};
