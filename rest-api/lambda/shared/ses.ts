import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new SESClient({});

export const sendMail = async ({ message, subject }: { message: string; subject: string }) => {
    const TO_ADDRESS = process.env.SES_IDENTITY;

    const result = await client.send(
        new SendEmailCommand({
            Destination: {
                ToAddresses: TO_ADDRESS ? [TO_ADDRESS] : [],
            },
            Message: {
                Subject: { Data: subject },
                Body: {
                    Text: { Data: message },
                },
            },
            Source: process.env.SES_IDENTITY,
        }),
    );

    console.log('E-mail enviado! ID:', result.MessageId);
};
