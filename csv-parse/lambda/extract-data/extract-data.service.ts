import { S3EventRecord } from "aws-lambda";
import { s3 } from "../_shared/infra/s3";
import { parse } from "csv-parse";
import { archiveRepository } from "../_shared/repository/archive.repository";
import { dataRepository } from "../_shared/repository/data.repository";
import { sendNotification } from "../_shared/infra/send-notification";
import { normalizeRow } from "../_shared/utils/normalize.util";
import { ObjectId } from "mongodb";
import { dbHelper } from "../_shared/repository/db-helper";

export const service = async ({
  s3Record,
}: {
  s3Record: S3EventRecord;
}): Promise<void> => {
  const session = dbHelper.getClient().startSession();
  let lines = 0;

  const file = await archiveRepository.getFileByKey({
    key: s3Record.s3.object.key,
  });

  if (!file || !file.user) {
    console.log(`File not found for key: ${s3Record.s3.object.key}. Skipping.`);
    return;
  }

  const fileOwnerEmail = file.user.email;

  try {
    session.startTransaction();

    await archiveRepository.updateStatus(
      {
        key: s3Record.s3.object.key,
        message: "",
        status: "PROCESSING",
      },
      session
    );

    const stream = await s3.getObject({
      key: s3Record.s3.object.key,
      Bucket: s3Record.s3.bucket.name,
    });

    const chunk = [];

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
          createdAt: new Date(),
        };

        chunk.push(data);

        if (chunk.length === 10000) {
          await dataRepository.save(chunk, session);
          lines += chunk.length;
          chunk.length = 0;
        }
      } catch (error) {
        console.log({ error });
      }
    }

    if (chunk.length) {
      await dataRepository.save(chunk, session);
      lines += chunk.length;
    }

    const message = `Process completed successfully: Processed ${lines} records.`;

    await archiveRepository.updateStatus(
      {
        key: s3Record.s3.object.key,
        status: !lines ? "FAILED" : "COMPLETED",
        message,
        lines,
      },
      session
    );

    const response = await sendNotification.send({
      message,
      email: fileOwnerEmaill,
    });

    if (!response.ok) {
      console.log(
        `Failed to send notification: ${response.status} ${response.statusText}`
      );
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log("Transaction aborted due to error:", error);

    const message = `Error processing file ${s3Record.s3.object.key}: ${
      error instanceof Error ? error.message : String(error)
    }`;

    await archiveRepository.updateStatus(
      {
        key: s3Record.s3.object.key,
        status: "FAILED",
        message,
        lines: 0,
      },
      session
    );

    await sendNotification.send({
      message,
      email: fileOwnerEmail,
    });
  } finally {
    session.endSession();

    await s3.removeObject({
      Key: s3Record.s3.object.key,
      Bucket: s3Record.s3.bucket.name,
    });
  }
};
