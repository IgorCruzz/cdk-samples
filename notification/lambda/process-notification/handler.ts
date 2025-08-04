import { SQSEvent } from "aws-lambda";
import { service } from "./notifier-process.service";

export const handler = async (event: SQSEvent) => {
  const { Records } = event;

  console.log({ event });

  return await service({ records: Records });
};
