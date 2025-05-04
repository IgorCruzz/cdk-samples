import { SQSBatchResponse, SQSRecord } from 'aws-lambda';
import { NotifyType } from '../types';
import { TwilioAdapterInterface, SesAdapterInterface } from '../shared';

export interface NotifierProcessServiceInterface {
    process: (args: { records: SQSRecord[] }) => Promise<SQSBatchResponse>;
}

export class NotifierProcessService implements NotifierProcessServiceInterface {
    constructor(
        private readonly twilioAdapter: TwilioAdapterInterface,
        private readonly sesAdapter: SesAdapterInterface,
    ) {}

    process = async ({ records }: { records: SQSRecord[] }): Promise<SQSBatchResponse> => {
        const serviceSender: {
            [key: string]: (args: { notification: NotifyType }) => Promise<void>;
        } = {
            EMAIL: this.sesAdapter.sendMail,
            WHATSAPP: this.twilioAdapter.sendWhatsAppMessage,
        };

        const batchItemFailures = [];

        for (const record of records) {
            try {
                const notification: NotifyType = JSON.parse(record.body);

                const { service } = notification;

                await serviceSender[service]({
                    notification,
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
}
