import { S3Event } from "aws-lambda";
import { service } from "./extract-data.service";

import { dbHelper } from "../_shared/repository/db-helper";
import { secret } from "../_shared/infra/secret";

let isConnected = false;

export const handler = async (event: S3Event) => {
  if (!isConnected) {
    const uri = await secret.getMongoUri();
    await dbHelper.connect(uri);
    isConnected = true;
  }

  for (const record of event.Records) {
    return await service({ s3Record: record });
  }
};
