import { SQSBatchResponse, SQSRecord } from "aws-lambda";
import { NotifyType } from "../_shared/types/notifier.type";
import { twilio } from "../_shared/infra/twilio";
import { ses } from "../_shared/infra/ses";

export const service = async ({
  records,
}: {
  records: SQSRecord[];
}): Promise<SQSBatchResponse> => {
  const serviceSender: {
    [key: string]: (args: { notification: NotifyType }) => Promise<void>;
  } = {
    EMAIL: ses.sendMail,
    WHATSAPP: twilio.sendWhatsAppMessage,
  };

  const batchItemFailures = [];

  for (const record of records) {
    try {
      const notification: NotifyType = JSON.parse(record.body);

      const { service } = notification;

      await serviceSender[service]({
        notification,
      });
    } catch (error) {
      console.error("Erro ao processar a mensagem:", error);
      batchItemFailures.push({
        itemIdentifier: record.messageId,
      });
    }
  }

  return { batchItemFailures };
};
