import { S3EventRecord } from "aws-lambda";
import { S3Interface } from "../shared/s3";
import { parse } from "csv-parse";
import { customerSchema } from "../schema/customer.schema";
import { IArchiveRepository } from "../repository/archive.repository";
import { ICustomerRepository } from "../repository/customer.repository";

export class ExtractDataService {
  constructor(
    private readonly s3: S3Interface,
    private readonly customerRepository: ICustomerRepository,
    private readonly archiveRepository: IArchiveRepository
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

      const archive = await this.archiveRepository.save({
        key: s3Record.s3.object.key,
        size: s3Record.s3.object.size,
        message: `Processing file ${s3Record.s3.object.key}...`,
        status: "PROCESSING",
      });

      if (!archive.success) {
        throw new Error(archive.message);
      }

      for await (const customer of stream.pipe(
        parse({
          skipEmptyLines: true,
          columns: true,
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
          console.log({ error });

          failure += 1;
        }
      }

      if (chunk.length) {
        await this.customerRepository.save({ data: chunk });
        success += chunk.length;
        chunk.length = 0;
      }

      await this.s3.removeObject({
        Key: s3Record.s3.object.key,
        Bucket: s3Record.s3.bucket.name,
      });

      const message = `Process completed successfully. Processed ${success} records with ${failure} failures.`;

      await this.archiveRepository.updateStatus({
        key: s3Record.s3.object.key,
        status: "COMPLETED",
      });

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
                title: "File processed",
                message,
              },
              {
                service: "WHATSAPP",
                title: "File processed",
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
    } catch (error) {
      await this.archiveRepository.updateStatus({
        key: s3Record.s3.object.key,
        status: "FAILED",
      });

      throw new Error(
        `Error processing S3 record: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };
}
