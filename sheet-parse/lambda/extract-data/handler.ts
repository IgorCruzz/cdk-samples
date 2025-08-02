import { S3Event } from "aws-lambda";
import { service } from "./extract-data.service";
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

export const handler = async (event: S3Event) => {
  if (!isConnected) {
    const uri = await getMongoUri();
    await dbHelper.connect(uri);
    isConnected = true;
  }

  for (const record of event.Records) {
    return await service({ s3Record: record });
  }
};
