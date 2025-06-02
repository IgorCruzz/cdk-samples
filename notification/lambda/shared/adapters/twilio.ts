import { Twilio } from "twilio";
import { NotifyType } from "../types";
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SENDER_PHONE = process.env.TWILIO_SENDER_PHONE;
const RECEIVER_PHONE = process.env.TWILIO_RECEIVER_PHONE;

const client = new Twilio(ACCOUNT_SID, AUTH_TOKEN);

export interface TwilioAdapterInterface {
  sendWhatsAppMessage: (args: { notification: NotifyType }) => Promise<void>;
}

export class TwilioAdapter implements TwilioAdapterInterface {
  sendWhatsAppMessage = async ({
    notification,
  }: {
    notification: NotifyType;
  }) => {
    const { message } = notification;

    await client.messages.create({
      from: `whatsapp:${SENDER_PHONE}`,
      to: `whatsapp:${RECEIVER_PHONE}`,
      body: message,
    });

    return;
  };
}
