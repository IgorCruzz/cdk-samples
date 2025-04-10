import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { NotifyType } from './types/notifier-types';
import { NotifyRepository } from './services/sns-services';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body: { notifications: NotifyType[] } = JSON.parse(event.body || '');

        await NotifyRepository.publishMessage(body.notifications);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Notifications sent successfully',
            }),
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
