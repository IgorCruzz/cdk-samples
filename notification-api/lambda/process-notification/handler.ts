import { SQSEvent } from "aws-lambda";
import { NotifierProcessService } from "./service/notifier-process.service";
import { TwilioAdapter } from "../shared/adapters/twilio";
import { SesAdapter } from "../shared/adapters/ses";

export const notifierProcessHandler = async (event: SQSEvent) => {
  const { Records } = event;

  const twilioAdapter = new TwilioAdapter();
  const sesAdapter = new SesAdapter();
  const notifierProcessService = new NotifierProcessService(
    twilioAdapter,
    sesAdapter
  );
  return await notifierProcessService.process({ records: Records });
};
