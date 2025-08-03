import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./signup.services";

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

    const data = JSON.parse(event.body || "{}");

    const response = await service(data);

    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return internal();
  }
};
