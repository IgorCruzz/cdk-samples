import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { NotifyType } from '../types';
import { notifierSendService } from '../services';

export const notifierSendController = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body: { notifications: NotifyType[] } = JSON.parse(event.body || '');

        const service = await notifierSendService({ notifications: body.notifications });

        return {
            statusCode: service.statusCode,
            body: service.body,
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error',
            }),
        };
    }
};
