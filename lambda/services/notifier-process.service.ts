import { SQSRecord } from 'aws-lambda';
import { INotifierRepository } from '../repositories';

export interface INotifierProcessService {
    process(event: SQSRecord): Promise<void>;
}
export class NotifierProcessService implements INotifierProcessService {
    constructor(private readonly notifierRepository: INotifierRepository) {}

    process = async (record: SQSRecord): Promise<void> => {
        const message = JSON.parse(record.body);

        await this.notifierRepository.putItem({
            message: message.message,
            priority: message.priority,
            userId: message.userId,
            title: message.title,
        });

        console.log('Notificação salva com sucesso!!!');
    };
}
