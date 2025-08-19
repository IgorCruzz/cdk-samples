import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./add-data.services";

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

    const { archiveId } = event.pathParameters as {
      archiveId: string;
    };

    const body = JSON.parse(event.body || "{}");

    const response = await service({ ...body, archiveId });

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
