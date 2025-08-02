import { APIGatewayProxyResult } from "aws-lambda";
import { NotifyType } from "../_shared/types/notifier.type";
import { sns } from "../_shared/infra/sns";

export const service = async ({
  notifications,
}: {
  notifications: NotifyType[];
}): Promise<APIGatewayProxyResult> => {
  await sns.publishBatchMessage({
    data: notifications,
    attributes: [
      {
        dataType: "String",
        stringValue: "service",
      },
    ],
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Notifications sent successfully",
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  };
};
