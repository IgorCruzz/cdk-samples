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
    try {
      const stream = await this.s3.getObject({
        key: s3Record.s3.object.key,
        Bucket: s3Record.s3.bucket.name,
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

      const message = `Processamento concluído com sucesso! ${success} registros inseridos, ${failure} falhas.`;

      const response = await fetch(
        `https://api.igorcruz.space/notification/notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notifications: [
              {
                service: "EMAIL",
                title: "Processamento concluído",
                message,
              },
              {
                service: "WHATSAPP",
                title: "Processamento concluído",
                message,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to send notification: ${response.status} ${response.statusText}`
        );
      }

      console.log({ message });

      return;
    } catch (error) {
      throw new Error(
        `Error processing S3 record: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };
}
