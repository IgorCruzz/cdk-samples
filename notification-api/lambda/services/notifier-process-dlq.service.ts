import { SQSEvent } from 'aws-lambda';

export interface NotifierProcessDLQServiceInterface {
    process(event: SQSEvent): Promise<void>;
}

export class NotifierProcessDLQService implements NotifierProcessDLQServiceInterface {
    process = async (event: SQSEvent): Promise<void> => {
        for (const record of event.Records) {
            try {
                const body = JSON.parse(record.body);

                console.log('Error on send Notification ', body);
            } catch (error) {
                console.error(error);
            }
        }
    };
}
