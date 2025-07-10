import { SQSEvent } from "aws-lambda";
import { service } from "./notifier-process.service";

export const notifierProcessHandler = async (event: SQSEvent) => {
  const { Records } = event;

  return await service({ records: Records });
};
