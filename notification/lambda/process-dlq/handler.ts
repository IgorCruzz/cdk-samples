import { SQSEvent } from "aws-lambda";
import { service } from "./process-dlq.service";

export const notifierProcessDLQHandler = async (event: SQSEvent) => {
  const { Records } = event;

  return await service({ records: Records });
};
