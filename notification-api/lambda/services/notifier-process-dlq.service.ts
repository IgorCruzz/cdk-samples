import { SQSRecord } from 'aws-lambda';
import { SNSSAdapterInterface } from '../shared';

export interface NotifierProcessDLQServiceInterface {
    process({ records }: { records: SQSRecord[] }): Promise<void>;
}

export class NotifierProcessDLQService implements NotifierProcessDLQServiceInterface {
    constructor(private readonly snsSAdapter: SNSSAdapterInterface) {}

    process = async ({ records }: { records: SQSRecord[] }): Promise<void> => {
        for (const record of records) {
            try {
                const body = JSON.parse(record.body);

                console.log('Error on send Notification ', body);

                await this.snsSAdapter.publishMessage({
                    data: body,
                });
            } catch (error) {
                console.error(error);
            }
        }
    };
}
