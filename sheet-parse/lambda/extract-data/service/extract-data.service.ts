import { S3EventRecord } from "aws-lambda";
import { S3Interface } from "../../shared/s3";
import { parse } from "csv-parse";

export class ExtractDataService {
  constructor(private readonly s3: S3Interface) {}

  extract = async ({ s3Record }: { s3Record: S3EventRecord }) => {
    const stream = await this.s3.getObject({
      key: s3Record.s3.object.key,
      Bucket: "sheet-parse-bucket",
    });

    const chunk = [];

    for await (const customer of stream.pipe(
      parse({
        skipEmptyLines: true,
        columns: true,
        trim: true,
      })
    )) {
      chunk.push(customer);

      if (chunk.length === 20) {
        chunk.length = 0;
      }
    }

    if (chunk.length > 0) {
      chunk.length = 0;
    }

    return;
  };
}
