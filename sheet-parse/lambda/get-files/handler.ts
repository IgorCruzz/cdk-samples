import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./get-files.services";

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

    const sub = event.requestContext.authorizer?.jwt.claims?.sub;

    const page = parseInt(event.queryStringParameters?.page || "1");

    const limit = parseInt(event.queryStringParameters?.limit || "20");

    const files = await service({ page, limit, sub });

    return {
      statusCode: 200,
      body: JSON.stringify(files),
    };
  } catch (error) {
    console.error("Error in handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
