import { S3Event } from "aws-lambda";
import { S3 } from "../shared/s3";
import { ArchiveRepository } from "../repository/archive.repository";
import { CustomerRepository } from "../repository/customer.repository";
import { ExtractDataService } from "./extract-data.service";
import { SendNotification } from "../shared/send-notification";

export const extractDataHandler = async (event: S3Event) => {
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
