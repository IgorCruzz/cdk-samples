import { APIGatewayProxyResult } from 'aws-lambda';
import { NotifyType } from '../types';
import { publishMessage } from '../shared';

export const notifierSendService = async ({
    notifications,
}: {
    notifications: NotifyType[];
}): Promise<APIGatewayProxyResult> => {
    await publishMessage({ notifications });

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Notifications sent successfully',
        }),
    };
};
