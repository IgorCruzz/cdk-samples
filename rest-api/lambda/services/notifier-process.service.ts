import { SQSBatchResponse, SQSRecord } from 'aws-lambda';
import { NotifyType } from '../types';
import { sendWhatsAppMessage } from '../shared';

export const notifierProcessService = async ({ records }: { records: SQSRecord[] }): Promise<SQSBatchResponse> => {
    const batchItemFailures = [];

    for (const record of records) {
        try {
            const notification: NotifyType = JSON.parse(record.body);

            const { message, service } = notification;

            if (service === 'WHATSAPP') {
                await sendWhatsAppMessage({
                    message,
                });
            }
        } catch (error) {
            console.error('Erro ao processar a mensagem:', error);
            batchItemFailures.push({
                itemIdentifier: record.messageId,
            });
        }
    }

    return { batchItemFailures };
};
