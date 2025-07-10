import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./notifier-send.service";
import { NotifyType } from "../shared/types/notifier.type";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const body: { notifications: NotifyType[] } = JSON.parse(event.body || "");

    await service({ notifications: body.notifications });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Notifications sent successfully",
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Api-Key",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Api-Key",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    };
  }
};
