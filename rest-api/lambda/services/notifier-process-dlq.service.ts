import { SQSEvent } from 'aws-lambda';

export const notifierProcessDLQService = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        try {
            const body = JSON.parse(record.body);

            console.log('Error on send Notification ', body);
        } catch (error) {
            console.error(error);
        }
    }
};
