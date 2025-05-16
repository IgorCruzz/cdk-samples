import { APIGatewayProxyEvent } from "aws-lambda";
import { NotifierSendService } from "./service/notifier-send.service";
import { NotifyType } from "../shared/types";
import { SNSSAdapter } from "../shared/adapters/sns";

export const notifierSendHandler = async (event: APIGatewayProxyEvent) => {
  const body: { notifications: NotifyType[] } = JSON.parse(event.body || "");

  const snsAdapter = new SNSSAdapter();
  const notifierSendService = new NotifierSendService(snsAdapter);

  return await notifierSendService.send({ notifications: body.notifications });
};
