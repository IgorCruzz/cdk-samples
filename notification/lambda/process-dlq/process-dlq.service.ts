import { SQSRecord } from "aws-lambda";
import { sns } from "../_shared/infra/sns";

export const service = async ({
  records,
}: {
  records: SQSRecord[];
}): Promise<void> => {
  for (const record of records) {
    try {
      const body = JSON.parse(record.body);

      console.log("Error on send Notification ", body);

      await sns.publishMessage({
        data: body,
      });
    } catch (error) {
      console.error(error);
    }
  }
};
