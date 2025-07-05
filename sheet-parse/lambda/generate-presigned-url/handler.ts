import { GeneratePresignedUrlService } from "./generate-presigned-url.service";
import { S3 } from "../shared/infra/s3";

export const generatePreSignedUrlHandler = async () => {
  const s3 = new S3();

  const generatePresignedUrlService = new GeneratePresignedUrlService(s3);

  return await generatePresignedUrlService.generate();
};
