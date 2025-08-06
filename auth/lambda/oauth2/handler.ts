import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./oauth2.services";
import { internal } from "../_shared/http/500";
import { secret } from "../_shared/infra/secret";
import { dbHelper } from "../_shared/repository/db-helper";

let isConnected = false;

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!isConnected) {
      const uri = await secret.getMongoUri();
      await dbHelper.connect(uri);
      isConnected = true;
    }

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
        Location: `http://localhost:5173/redirect?id_token=${response.data?.idToken}&access_token=${response.data?.accessToken}&refresh_token=${response.data?.refreshToken}`,
      },
    };
  } catch (error) {
    console.error("Error:", error);
    return internal();
  }
};
