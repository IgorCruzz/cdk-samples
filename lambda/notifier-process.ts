import { SQSEvent, SQSBatchResponse } from 'aws-lambda';
import { DynamoDBService } from './services/dynamodb.service';

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    const batchItemFailures = [];

    for (const record of event.Records) {
        try {
            const body = JSON.parse(record.body);
            const message = JSON.parse(body.Message);

            console.log('Mensagem recebida:', message);

            if (message.message === 'error') {
                throw new Error('Simulando erro para teste');
            }

            await DynamoDBService.putItem({
                message: message.message,
                priority: message.priority,
                userId: message.userId,
                title: message.title,
            });

            console.log('Notificação salva com sucesso!!!', message);
        } catch (error) {
            console.error('Erro ao processar a mensagem:', error);

            batchItemFailures.push({
                itemIdentifier: record.messageId,
            });
        }
    }

    return { batchItemFailures };
};
