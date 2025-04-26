import { NotifyType } from '../types';
import { notifierTable } from '../repositories';

export const notifierProcessService = async ({ notification }: { notification: NotifyType }): Promise<void> => {
    const { message, priority, title, userId } = notification;

    await notifierTable.putItem({
        message,
        priority,
        userId,
        title,
    });

    console.log('Notificação salva com sucesso!!!');
};
