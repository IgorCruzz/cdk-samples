import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./delete-data.services";

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
    const { userId, endpoint, dataId } = event.pathParameters as {
      userId: string;
      endpoint: string;
      dataId: string;
    };

    const response = await service({ id: dataId, userId, endpoint });

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
    console.error("Error in handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
