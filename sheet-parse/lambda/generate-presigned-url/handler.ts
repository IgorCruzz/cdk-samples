import { APIGatewayProxyEvent } from "aws-lambda";
import { GeneratePresignedUrlService } from "./service/generate-presigned-url";
import { S3Adapter } from "../shared/adapters/s3";

export const generatePreSignedUrlHandler = async (
  event: APIGatewayProxyEvent
) => {
  const s3Adapter = new S3Adapter();

  const generatePresignedUrlService = new GeneratePresignedUrlService(
    s3Adapter
  );

  return await generatePresignedUrlService.generate();
};
