import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./signin.services";

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

import { dbHelper } from "../shared/repository/db-helper";
import { internal } from "../shared/http/500";

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
