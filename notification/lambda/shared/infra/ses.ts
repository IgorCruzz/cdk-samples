import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { NotifyType } from "../types/notifier.type";

const client = new SESClient({});

export interface SesInterface {
  sendMail: (args: { notification: NotifyType }) => Promise<void>;
}

export const ses: SesInterface = {
  async sendMail({ notification }: { notification: NotifyType }) {
    const { title, message } = notification;

    const TO_ADDRESS = process.env.SES_IDENTITY;

    if (!TO_ADDRESS) return;

    await client.send(
      new SendEmailCommand({
        Destination: {
          ToAddresses: [TO_ADDRESS],
        },
        Message: {
          Subject: { Data: title },
          Body: {
            Text: { Data: message },
          },
        },
        Source: TO_ADDRESS,
      })
    );
  },
};
