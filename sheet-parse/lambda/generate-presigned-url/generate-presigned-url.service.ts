import { s3 } from "../shared/infra/s3";

export const service = async (): Promise<{
  url: string;
  key: string;
}> => {
  const preSignedUrl = await s3.createPresignedUrl({
    bucket: process.env.BUCKET_NAME as string,
  });

  return {
    url: preSignedUrl.url,
    key: preSignedUrl.key,
  };
};
