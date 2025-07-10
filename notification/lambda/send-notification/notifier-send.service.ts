import { APIGatewayProxyResult } from "aws-lambda";
import { NotifyType } from "../shared/types/notifier.type";
import { sns } from "../shared/infra/sns";

export const service = async ({
  notifications,
}: {
  notifications: NotifyType[];
}): Promise<APIGatewayProxyResult> => {
  try {
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
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Api-Key",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    };
  } catch (err) {
    console.log(err);
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
