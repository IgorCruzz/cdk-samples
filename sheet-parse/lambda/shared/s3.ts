import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { Readable } from "stream";

const client = new S3Client({});

export interface S3Interface {
  createPresignedUrl: ({
    bucket,
  }: {
    bucket: string;
  }) => Promise<{ url: string; key: string }>;
  getObject: ({
    key,
    Bucket,
  }: {
    key: string;
    Bucket: string;
  }) => Promise<Readable>;
}

export class S3 implements S3Interface {
  createPresignedUrl = async ({
    bucket,
  }: {
    bucket: string;
  }): Promise<{ url: string; key: string }> => {
    const key = `${randomUUID()}.csv`;

    const params = {
      Bucket: bucket,
      Key: key,
    };

    const command = new PutObjectCommand(params);

    const url = await getSignedUrl(client, command, { expiresIn: 60 * 5 });

    return {
      url,
      key,
    };
  };

  getObject = async ({
    key,
    Bucket,
  }: {
    key: string;
    Bucket: string;
  }): Promise<Readable> => {
    const params: GetObjectCommandInput = {
      Bucket,
      Key: key,
    };

    const command = new GetObjectCommand(params);

    const { Body } = await client.send(command);

    if (!Body) {
      throw new Error("No file found");
    }

    return Body as Readable;
  };
}
