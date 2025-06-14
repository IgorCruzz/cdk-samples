import { APIGatewayProxyResult } from "aws-lambda";
import { IS3 } from "../shared/s3";

export interface IGeneratePresignedUrlService {
  generate: () => Promise<APIGatewayProxyResult>;
}

export class GeneratePresignedUrlService
  implements IGeneratePresignedUrlService
{
  constructor(private readonly s3: IS3) {}

  async generate(): Promise<APIGatewayProxyResult> {
    try {
      const preSignedUrl = await this.s3.createPresignedUrl({
        bucket: process.env.BUCKET_NAME as string,
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
