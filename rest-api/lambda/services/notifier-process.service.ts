import { SQSRecord } from 'aws-lambda';
import { putItem } from '../shared/notifier';

export const notifierProcessService = async (record: SQSRecord): Promise<void> => {
    const message = JSON.parse(record.body);

    await putItem({
        message: message.message,
        priority: message.priority,
        userId: message.userId,
        title: message.title,
    });

    console.log('Notificação salva com sucesso!!!');
};
