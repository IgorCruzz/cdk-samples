import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./delete-users.services";

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

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
  if (!isConnected) {
    const uri = await getMongoUri();
    await dbHelper.connect(uri);
    isConnected = true;
  }

  const { id } = event.pathParameters as { id: string };

  return await service({ id });
};
