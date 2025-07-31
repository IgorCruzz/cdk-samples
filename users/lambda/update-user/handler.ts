import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./update-users.services";
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

    const data = JSON.parse(event.body || "{}");

    const { id } = event.pathParameters as { id: string };

    const response = await service({ id, ...data });

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in handler:", error);
    return internal();
  }
};
