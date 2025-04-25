import { SQSEvent, SQSBatchResponse } from 'aws-lambda';
import { NotifierProcessService } from '../services';

export const notifierProcessController = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    const batchItemFailures = [];

    for (const record of event.Records) {
        try {
            await NotifierProcessService.process(record);
        } catch (error) {
            console.error('Erro ao processar a mensagem:', error);
            batchItemFailures.push({
                itemIdentifier: record.messageId,
            });
        }
    }

    return { batchItemFailures };
};
