import { APIGatewayProxyResult } from 'aws-lambda';
import { NotifyType } from '../types';
import { publishMessage } from '../shared/sns';

export const notifierValidationService = async ({
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
