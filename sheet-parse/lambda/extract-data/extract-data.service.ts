import { S3EventRecord } from "aws-lambda";
import { IS3 } from "../shared/s3";
import { parse } from "csv-parse";
import { customerSchema } from "../schema/customer.schema";
import { IArchiveRepository } from "../repository/archive.repository";
import { ICustomerRepository } from "../repository/customer.repository";
import { ISendNotification } from "../shared/send-notification";

type ExtractDataServiceInput = {
  s3Record: S3EventRecord;
};

type ExtractDataServiceOutput = Promise<void>;

interface IExtractDataService {
  extract: (input: ExtractDataServiceInput) => ExtractDataServiceOutput;
}

export class ExtractDataService implements IExtractDataService {
  constructor(
    private readonly s3: IS3,
    private readonly customerRepository: ICustomerRepository,
    private readonly archiveRepository: IArchiveRepository,
    private readonly sendNotification: ISendNotification
  ) {}
  s3Record: S3EventRecord;

  extract = async ({
    s3Record,
  }: ExtractDataServiceInput): ExtractDataServiceOutput => {
    try {
      const stream = await this.s3.getObject({
        key: s3Record.s3.object.key,
        Bucket: s3Record.s3.bucket.name,
      });

      const chunk = [];
      let success = 0;
      let failure = 0;

      const archive = await this.archiveRepository.save({
        key: s3Record.s3.object.key,
        size: s3Record.s3.object.size,
        message: ``,
        status: "PROCESSING",
      });

      if (!archive.success) {
        throw new Error(archive.message);
      }

      for await (const customer of stream.pipe(
        parse({
          skipEmptyLines: true,
          columns: (header) => {
            const allowedHeaders = [
              "Nome",
              "CNPJ",
              "Email",
              "Telefone",
              "Endereço",
              "Cidade",
              "Estado",
              "CEP",
            ];

            const verifyHeaders = header.every((h: string) =>
              allowedHeaders.includes(h)
            );

            if (!verifyHeaders) {
              throw new Error(
                `Invalid headers in CSV file. Expected: ${allowedHeaders.join(
                  ", "
                )}`
              );
            }

            return header;
          },
          trim: true,
        })
      )) {
        try {
          const data = {
            name: customer["Nome"],
            cnpj: customer["CNPJ"],
            email: customer["Email"],
            phone: customer["Telefone"],
            address: customer["Endereço"],
            city: customer["Cidade"],
            state: customer["Estado"],
            zipCode: customer["CEP"],
          };

          const validation = customerSchema.safeParse(data);

          if (!validation.success) {
            failure += 1;
            continue;
          }

          chunk.push(data);

          if (chunk.length === 25) {
            await this.customerRepository.save({ data: chunk });

            success += chunk.length;
            chunk.length = 0;
          }
        } catch (error) {
          console.log({ from: "CSV", error });

          failure += 1;
        }
      }

      if (chunk.length) {
        try {
          await this.customerRepository.save({ data: chunk });

          success += chunk.length;
          chunk.length = 0;
        } catch (error) {
          console.log({ error });
          failure += chunk.length;
        }
      }

      const message = `Process completed successfully: Processed ${success} records with ${failure} failures.`;

      await this.archiveRepository.updateStatus({
        key: s3Record.s3.object.key,
        status: "COMPLETED",
        message,
        successLines: success,
        failedLines: failure,
      });

      const response = await this.sendNotification.send({
        message,
      });

      if (!response.ok) {
        console.log(
          `Failed to send notification: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.log({ error });

      const message = `Error processing file ${s3Record.s3.object.key}: ${
        error instanceof Error ? error.message : String(error)
      }`;

      await this.archiveRepository.updateStatus({
        key: s3Record.s3.object.key,
        status: "FAILED",
        message,
        successLines: 0,
        failedLines: 0,
      });

      await this.sendNotification.send({
        message,
      });

      console.log(
        `Error processing S3 record: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      await this.s3.removeObject({
        Key: s3Record.s3.object.key,
        Bucket: s3Record.s3.bucket.name,
      });
    }
  };
}
