import { S3Event } from "aws-lambda";
import { S3 } from "../shared/infra/s3";
import { ArchiveRepository } from "../shared/repository/archive.repository";
import { CustomerRepository } from "../shared/repository/customer.repository";
import { ExtractDataService } from "./extract-data.service";
import { SendNotification } from "../shared/infra/send-notification";
import { dbHelper } from "../shared/repository/db-helper";

let isDbConnected = false;

const encodedPassword = encodeURIComponent(
  process.env.DOCDB_PASSWORD as string
);

const MONGO_URI = `mongodb://${process.env.DOCDB_USER}:${encodedPassword}@${process.env.DOCDB_URI}:27017/sheet-parse`;

export const extractDataHandler = async (event: S3Event) => {
  console.log({ MONGO_URI });

  if (!isDbConnected) {
    await dbHelper.connect(MONGO_URI || "");
    isDbConnected = true;
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

    return extractDataService.extract({ s3Record: record });
  }
};
