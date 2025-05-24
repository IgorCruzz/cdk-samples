import { S3Event } from "aws-lambda";
import { S3 } from "../shared/s3";
import { DynamoDB } from "../shared/dynamodb";
import { ExtractDataService } from "./extract-data.service";

export const extractDataHandler = async (event: S3Event) => {
  for (const record of event.Records) {
    const s3 = new S3();
    const dynamoDB = new DynamoDB();
    const extractDataService = new ExtractDataService(s3, dynamoDB);

    return extractDataService.extract({ s3Record: record });
  }
};
