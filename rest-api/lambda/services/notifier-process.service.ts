import { SQSBatchResponse, SQSRecord } from 'aws-lambda';
import { notifierTable } from '../repositories';
import { NotifyType } from '../types';

export const notifierProcessService = async ({ records }: { records: SQSRecord[] }): Promise<SQSBatchResponse> => {
    const batchItemFailures = [];

    for (const record of records) {
        try {
            const notification: NotifyType = JSON.parse(record.body);

            const { message, priority, title, userId } = notification;

            await notifierTable.putItem({
                message,
                priority,
                userId,
                title,
            });
        } catch (error) {
            console.error('Erro ao processar a mensagem:', error);
            batchItemFailures.push({
                itemIdentifier: record.messageId,
            });
        }
    }

    return { batchItemFailures };
};
