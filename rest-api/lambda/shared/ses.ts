import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new SESClient({});

export const sendMail = async ({ message, subject }: { message: string; subject: string }) => {
    const result = await client.send(
        new SendEmailCommand({
            Destination: {
                ToAddresses: ['igorcruz.dev@gmail.com'],
            },
            Message: {
                Subject: { Data: subject },
                Body: {
                    Text: { Data: message },
                },
            },
            Source: 'igorcruz.dev@gmail.com',
        }),
    );

    console.log('E-mail enviado! ID:', result.MessageId);
};
