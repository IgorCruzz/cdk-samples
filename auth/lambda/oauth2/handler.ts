import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./oauth2.services";
import { internal } from "../shared/http/500";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const code = event.queryStringParameters?.code;

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "code is required",
          success: false,
          data: null,
        }),
      };
    }

    const response = await service({
      code,
    });

    if (!response.success) {
      return {
        statusCode: 400,
        body: JSON.stringify(response),
      };
    }

    return {
      statusCode: 302,
      headers: {
        Location: `http://localhost:5173/redirect?access_token=${response.data?.accessToken}&refresh_token=${response.data?.refreshToken}`,
      },
    };
  } catch (error) {
    console.error("Error:", error);
    return internal();
  }
};
