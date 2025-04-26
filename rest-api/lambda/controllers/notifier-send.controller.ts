import { APIGatewayProxyResult } from 'aws-lambda';
import { NotifyType } from '../types';
import { notifierSendService } from '../services';

export const notifierSendController = async ({
    notifications,
}: {
    notifications: NotifyType[];
}): Promise<APIGatewayProxyResult> => {
    try {
        const service = await notifierSendService({ notifications });

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
