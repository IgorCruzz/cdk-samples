import { S3EventRecord } from "aws-lambda";
import { s3 } from "../shared/infra/s3";
import { parse } from "csv-parse";
import { customerSchema } from "../shared/schema/customer.schema";
import { archiveRepository } from "../shared/repository/archive.repository";
import { customerRepository } from "../shared/repository/customer.repository";
import { sendNotification } from "../shared/infra/send-notification";

export const service = async ({
  s3Record,
}: {
  s3Record: S3EventRecord;
}): Promise<void> => {
  let success = 0;
  let failure = 0;

  try {
    const stream = await s3.getObject({
      key: s3Record.s3.object.key,
      Bucket: s3Record.s3.bucket.name,
    });

    const chunk = [];

    await archiveRepository.save({
      key: s3Record.s3.object.key,
      size: s3Record.s3.object.size,
      message: ``,
      status: "PROCESSING",
    });

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
          await customerRepository.save({ data: chunk });

          success += chunk.length;
          chunk.length = 0;
        }
      } catch (error) {
        console.log({ error });

        failure += 1;
      }
    }

    if (chunk.length) {
      try {
        await customerRepository.save({ data: chunk });

        success += chunk.length;
        chunk.length = 0;
      } catch (error) {
        console.log({ error });
        failure += chunk.length;
      }
    }

    const message = `Process completed successfully: Processed ${success} records with ${failure} failures.`;

    await archiveRepository.updateStatus({
      key: s3Record.s3.object.key,
      status: !success ? "FAILED" : "COMPLETED",
      message,
      successLines: success,
      failedLines: failure,
    });

    const response = await sendNotification.send({
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

    await archiveRepository.updateStatus({
      key: s3Record.s3.object.key,
      status: "FAILED",
      message,
      successLines: success,
      failedLines: failure,
    });

    await sendNotification.send({
      message,
    });

    console.log(
      `Error processing S3 record: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
