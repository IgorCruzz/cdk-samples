import { ArchiveRepository } from "../shared/repository/archive.repository";
import { GetStatisticServices } from "./get-statistic.service";
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
  if (!isConnected) {
    const uri = await getMongoUri();
    await dbHelper.connect(uri);
    isConnected = true;
  }

  const archiveRepository = new ArchiveRepository();
  const getFilesServices = new GetStatisticServices(archiveRepository);

  return getFilesServices.getFiles();
};
