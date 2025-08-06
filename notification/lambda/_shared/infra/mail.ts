import SibApiV3Sdk from "sib-api-v3-sdk";
import { NotifyType } from "../types/notifier.type";
import { secret } from "./secret";

export interface SesInterface {
  sendMail: (input: NotifyType) => Promise<void>;
}

export const mail: SesInterface = {
  async sendMail({ title, message, email }: NotifyType) {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = await secret.getBrevoApiKey();
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const FROM_ADDRESS = "igorcruz.dev@gmail.com";

    const sendSmtpEmail = {
      to: [{ email }],
      sender: {
        email: FROM_ADDRESS,
        name: "CsvParse",
      },
      subject: title,
      htmlContent: `<p>${message}</p>`,
    };

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error("Erro ao enviar e-mail com Brevo:", error);
    }
  },
};
