import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./get-users.services";

import { internal } from "../_shared/http/500";

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

    const page = parseInt(event.queryStringParameters?.page || "1");

    const limit = parseInt(event.queryStringParameters?.limit || "20");

    const files = await service({ page, limit });

    return {
      statusCode: 200,
      body: JSON.stringify(files),
    };
  } catch (error) {
    console.error("Error in handler:", error);
    return internal();
  }
};
