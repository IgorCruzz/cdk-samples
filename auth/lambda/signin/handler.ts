import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./signin.services";
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

    const data = JSON.parse(event.body || "{}");

    const response = await service(data);

    if (!response.success) {
      return {
        statusCode: 400,
        body: JSON.stringify(response),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error:", error);
    return internal();
  }
};
