import { APIGatewayProxyResult } from 'aws-lambda';
import { NotifyType } from '../types';
import { SNSSAdapterInterface } from '../shared';

export interface NotifierSendServiceInterface {
    send: (params: { notifications: NotifyType[] }) => Promise<APIGatewayProxyResult>;
}

export class NotifierSendService implements NotifierSendServiceInterface {
    constructor(private readonly snsAdapter: SNSSAdapterInterface) {}

    async send({ notifications }: { notifications: NotifyType[] }): Promise<APIGatewayProxyResult> {
        try {
            await this.snsAdapter.publishBatchMessage({
                data: notifications,
                attributes: [
                    {
                        dataType: 'String',
                        stringValue: 'service',
                    },
                ],
            });

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
    }
}
