import { SQSRecord } from 'aws-lambda';

export interface NotifierProcessDLQServiceInterface {
    process({ records }: { records: SQSRecord[] }): Promise<void>;
}

export class NotifierProcessDLQService implements NotifierProcessDLQServiceInterface {
    process = async ({ records }: { records: SQSRecord[] }): Promise<void> => {
        for (const record of records) {
            try {
                const body = JSON.parse(record.body);

                console.log('Error on send Notification ', body);
            } catch (error) {
                console.error(error);
            }
        }
    };
}
