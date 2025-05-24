import { APIGatewayProxyResult } from "aws-lambda";
import { S3Interface } from "../shared/s3";

export interface GeneratePresignedUrlServiceInterface {
  generate: () => Promise<APIGatewayProxyResult>;
}

export class GeneratePresignedUrlService
  implements GeneratePresignedUrlServiceInterface
{
  constructor(private readonly s3: S3Interface) {}

  async generate(): Promise<APIGatewayProxyResult> {
    try {
      const preSignedUrl = await this.s3.createPresignedUrl({
        bucket: "sheet-parse-bucket",
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          url: preSignedUrl.url,
          key: preSignedUrl.key,
        }),
      };
    } catch (err) {
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Internal Server Error",
        }),
      };
    }
  }
}
