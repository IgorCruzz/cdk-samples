import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./delete-users.services";

import { dbHelper } from "../_shared/repository/db-helper";
import { internal } from "../_shared/http/500";
import { secret } from "../_shared/infra/secret";

let isConnected = false;

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!isConnected) {
      const uri = await secret.getMongoUri();
      await dbHelper.connect(uri);
      isConnected = true;
    }

    const { id } = event.pathParameters as { id: string };

    const response = await service({ id });

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in handler:", error);
    return internal();
  }
};
