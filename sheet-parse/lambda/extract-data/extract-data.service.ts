import { S3EventRecord } from "aws-lambda";
import { S3Interface } from "../shared/s3";
import { parse } from "csv-parse";
import { DynamoDBInterface } from "../shared/dynamodb";

export class ExtractDataService {
  constructor(
    private readonly s3: S3Interface,
    private readonly table: DynamoDBInterface
  ) {}

  extract = async ({ s3Record }: { s3Record: S3EventRecord }) => {
    const stream = await this.s3.getObject({
      key: s3Record.s3.object.key,
      Bucket: "sheet-parse-bucket",
    });

    const chunk = [];
    let success = 0;
    let failure = 0;

    for await (const customer of stream.pipe(
      parse({
        skipEmptyLines: true,
        columns: true,
        trim: true,
      })
    )) {
      try {
        chunk.push({
          firstName: customer["First Name"],
          lastName: customer["Last Name"],
          company: customer["Company"],
          city: customer["City"],
          country: customer["Country"],
          phone1: customer["Phone 1"],
          phone2: customer["Phone 2"],
          email: customer["Email"],
          website: customer["Website"],
        });

        if (chunk.length === 20) {
          await this.table.putItem({ data: chunk });
          success += chunk.length;
          chunk.length = 0;
        }
      } catch (error) {
        failure += 1;
      }
    }

    if (chunk.length) {
      await this.table.putItem({ data: chunk });
      success += chunk.length;
      chunk.length = 0;
    }

    console.log({
      SUCESS: success,
      FAILURE: failure,
    });

    return;
  };
}
