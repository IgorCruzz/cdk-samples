import { S3Event } from "aws-lambda";
import { S3 } from "../shared/infra/s3";
import { ArchiveRepository } from "../shared/repository/archive.repository";
import { CustomerRepository } from "../shared/repository/customer.repository";
import { ExtractDataService } from "./extract-data.service";
import { SendNotification } from "../shared/infra/send-notification";
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

export const extractDataHandler = async (event: S3Event) => {
  if (!isConnected) {
    const uri = await getMongoUri();
    await dbHelper.connect(uri);
    isConnected = true;
  }

  for (const record of event.Records) {
    const s3 = new S3();
    const archiveRepository = new ArchiveRepository();
    const customerRepository = new CustomerRepository();
    const sendNotification = new SendNotification();
    const extractDataService = new ExtractDataService(
      s3,
      customerRepository,
      archiveRepository,
      sendNotification
    );

    return await extractDataService.extract({ s3Record: record });
  }
};
