import { S3Event } from "aws-lambda";
import { S3 } from "../shared/s3";
import { ExtractDataService } from "../extract-data/service/extract-data.service";

export const extractDataHandler = async (event: S3Event) => {
  for (const record of event.Records) {
    const s3Adapter = new S3();
    const extractDataService = new ExtractDataService(s3Adapter);

    return extractDataService.extract({ s3Record: record });
  }
};
