import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const client = new S3Client({});

export interface S3AdapterInterface {
  createPresignedUrl: () => Promise<{ url: string; key: string }>;
}

export class S3Adapter implements S3AdapterInterface {
  createPresignedUrl = async (): Promise<{ url: string; key: string }> => {
    const key = `sheet-parse/${randomUUID()}.csv`;

    const params = {
      Bucket: "sheet-parse-bucket",
      Key: key,
      ContentType: "text/csv",
    };

    const command = new PutObjectCommand(params);

    const url = await getSignedUrl(client, command, { expiresIn: 60 * 5 });

    return {
      url,
      key,
    };
  };
}
