import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { NotifyType } from '../types';

const client = new SESClient({});

export interface SesAdapterInterface {
    sendMail: (args: { notification: NotifyType }) => Promise<void>;
}

export class SesAdapter implements SesAdapterInterface {
    sendMail = async ({ notification }: { notification: NotifyType }) => {
        const { title, message } = notification;

        const TO_ADDRESS = process.env.SES_IDENTITY;

        await client.send(
            new SendEmailCommand({
                Destination: {
                    ToAddresses: TO_ADDRESS ? [TO_ADDRESS] : [],
                },
                Message: {
                    Subject: { Data: title },
                    Body: {
                        Text: { Data: message },
                    },
                },
                Source: process.env.SES_IDENTITY,
            }),
        );

        return;
    };
}
