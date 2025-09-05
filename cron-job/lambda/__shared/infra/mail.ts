import SibApiV3Sdk from "sib-api-v3-sdk";
import { secret } from "./secret";

type sendMailInput = {
  title: string;
  message: string;
  email: string;
};

export interface SesInterface {
  sendMail: (input: sendMailInput) => Promise<void>;
}

export const mail: SesInterface = {
  async sendMail({ title, message, email }: sendMailInput) {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = await secret.getBrevoApiKey();
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const FROM_ADDRESS = "igorcruz.dev@gmail.com";

    const sendSmtpEmail = {
      to: [{ email }],
      sender: {
        email: FROM_ADDRESS,
        name: "Expired License Notifier",
      },
      subject: title,
      htmlContent: `<p>${message}</p>`,
    };

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error(error);
    }
  },
};
