import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./notifier-send.service";
import { NotifyType } from "../shared/types/notifier.type";

export const notifierSendHandler = async (event: APIGatewayProxyEvent) => {
  const body: { notifications: NotifyType[] } = JSON.parse(event.body || "");

  return await service({ notifications: body.notifications });
};
