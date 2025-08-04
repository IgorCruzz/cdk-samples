import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./generate-presigned-url.service";

import { dbHelper } from "../_shared/repository/db-helper";
import { secret } from "../_shared/infra/secret";

let isConnected = false;

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!isConnected) {
      const uri = await secret.getMongoUri();
      await dbHelper.connect(uri);
      isConnected = true;
    }

    const userId = event.requestContext.authorizer?.jwt.claims?.sub;

    const body = JSON.parse(event.body || "{}");

    const preSignedUrl = await service(userId, body.size, body.filename);

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: preSignedUrl.url,
        key: preSignedUrl.key,
      }),
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }
};
