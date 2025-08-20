import { SQSBatchResponse, SQSRecord } from "aws-lambda";
import { NotifyType } from "../_shared/types/notifier.type";
import { twilio } from "../_shared/infra/twilio";
import { mail } from "../_shared/infra/mail";

type Input = {
  records: SQSRecord[];
};

export const service = async ({
  records,
}: Input): Promise<SQSBatchResponse> => {
  const serviceSender: {
    [key: string]: (args: NotifyType) => Promise<void>;
  } = {
    EMAIL: mail.sendMail,
    WHATSAPP: twilio.sendWhatsAppMessage,
  };

  const batchItemFailures = [];

  for (const record of records) {
    try {
      const notification: NotifyType = JSON.parse(record.body);

      const { service } = notification;

      await serviceSender[service](notification);
    } catch (error) {
      console.error("Erro ao processar a mensagem:", error);
      batchItemFailures.push({
        itemIdentifier: record.messageId,
      });
    }
  }

  return { batchItemFailures };
};
