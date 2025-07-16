import { service } from "./get-statistic.service";
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

export const handler = async () => {
  try {
    if (!isConnected) {
      const uri = await getMongoUri();
      await dbHelper.connect(uri);
      isConnected = true;
    }

    const files = await service();

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
