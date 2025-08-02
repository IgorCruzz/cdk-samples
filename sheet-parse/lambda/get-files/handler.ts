import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./get-files.services";

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

import { dbHelper } from "../_shared/repository/db-helper";

const secretsManager = new SecretsManagerClient();

async function getMongoUri(): Promise<string> {
  const res = await secretsManager.send(
    new GetSecretValueCommand({
      SecretId: "mongodb/uri",
    })
  );

  const secret = JSON.parse(res.SecretString ?? "{}");
  return secret["MONGO_URI"];
}

let isConnected = false;

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!isConnected) {
      const uri = await getMongoUri();
      await dbHelper.connect(uri);
      isConnected = true;
    }

    const sub = event.requestContext.authorizer?.claims?.sub;

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
