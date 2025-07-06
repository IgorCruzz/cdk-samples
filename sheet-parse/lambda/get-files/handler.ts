import { APIGatewayProxyEvent } from "aws-lambda";
import { ArchiveRepository } from "../shared/repository/archive.repository";
import { GetFilesServices } from "./get-files.services";

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

export const getFilesDataHanlder = async (event: APIGatewayProxyEvent) => {
  if (!isConnected) {
    const uri = await getMongoUri();
    await dbHelper.connect(uri);
    isConnected = true;
  }

  const archiveRepository = new ArchiveRepository();
  const getFilesServices = new GetFilesServices(archiveRepository);

  const startKey = event.queryStringParameters?.startKey;

  const limit = parseInt(event.queryStringParameters?.limit || "20");

  return getFilesServices.getFiles({ startKey, limit });
};
