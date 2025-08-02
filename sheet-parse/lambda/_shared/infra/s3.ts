import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  DeleteObjectCommandInput,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import KSUID from "ksuid";
import { Readable } from "stream";

const client = new S3Client({});

export type CreatePresignedUrlInput = {
  bucket: string;
};

export type GetObjectInput = {
  key: string;
  Bucket: string;
};

export type RemoveObjectInput = {
  Key: string;
  Bucket: string;
};

export type CreatePresignedUrlOutput = {
  url: string;
  key: string;
};

export type GetObjectOutput = Readable;

export type RemoveObjectOutput = void;

export interface IS3 {
  createPresignedUrl: (
    input: CreatePresignedUrlInput
  ) => Promise<CreatePresignedUrlOutput>;
  getObject: (input: GetObjectInput) => Promise<GetObjectOutput>;
  removeObject: (input: RemoveObjectInput) => Promise<RemoveObjectOutput>;
}

export const s3: IS3 = {
  async createPresignedUrl({ bucket }) {
    const ID = await KSUID.random();
    const key = `${ID.string}.csv`;

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
  },

  async getObject({ key, Bucket }) {
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
  },

  async removeObject({ Key, Bucket }) {
    const params: DeleteObjectCommandInput = {
      Bucket,
      Key,
    };

    const command = new DeleteObjectCommand(params);
    await client.send(command);
  },
};
