import { S3EventRecord } from "aws-lambda";
import { s3 } from "../_shared/infra/s3";
import { parse } from "csv-parse";
import { archiveRepository } from "../_shared/repository/archive.repository";
import { dataRepository } from "../_shared/repository/data.repository";
import { sendNotification } from "../_shared/infra/send-notification";
import { normalizeRow } from "../_shared/utils/normalize.util";
import { ObjectId } from "mongodb";

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

    const file = await archiveRepository.getFileByKey(s3Record.s3.object.key);

    await archiveRepository.updateStatus({
      key: s3Record.s3.object.key,
      message: ``,
      status: "PROCESSING",
    });

    for await (const row of stream.pipe(
      parse({
        skipEmptyLines: true,
        trim: true,
        columns: true,
      })
    )) {
      try {
        const normalizedRow = normalizeRow(row);

        const data = {
          ...normalizedRow,
          archiveId: new ObjectId(file?.id),
        };

        chunk.push(data);

        if (chunk.length === 10000) {
          await dataRepository.save(chunk);

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
        await dataRepository.save(chunk);

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
  } finally {
    await s3.removeObject({
      Key: s3Record.s3.object.key,
      Bucket: s3Record.s3.bucket.name,
    });
  }
};
