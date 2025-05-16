import { SQSEvent } from "aws-lambda";
import { NotifierProcessDLQService } from "./service/process-dlq.service";
import { SNSSAdapter } from "../shared/adapters/sns";

export const notifierProcessDLQHandler = async (event: SQSEvent) => {
  const { Records } = event;

  const snsSAdapter = new SNSSAdapter();

  const notifierProcessDLQService = new NotifierProcessDLQService(snsSAdapter);

  return await notifierProcessDLQService.process({ records: Records });
};
