import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./update-users.services";

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { internal } from "../shared/http/500";

import { dbHelper } from "../shared/repository/db-helper";

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

    const data = JSON.parse(event.body || "{}");

    const { id } = event.pathParameters as { id: string };

    const response = await service({ id, ...data });

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Api-Key",
        "Access-Control-Allow-Methods": "PUT, OPTIONS",
      },
    };
  } catch (error) {
    console.error("Error in handler:", error);
    return internal();
  }
};
