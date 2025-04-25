import { SQSEvent } from 'aws-lambda';
import { notifierProcessDLQService } from '../services';

export const notifierProcessDLQController = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        try {
            const body = JSON.parse(record.body);

            await notifierProcessDLQService.process(body);
        } catch (error) {
            console.error(error);
        }
    }
};
