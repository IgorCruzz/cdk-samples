import { SQSEvent } from "aws-lambda";
import { service } from "./process-dlq.service";

export const handler = async (event: SQSEvent) => {
  const { Records } = event;

  return await service({ records: Records });
};
