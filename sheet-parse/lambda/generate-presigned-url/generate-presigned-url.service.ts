import { APIGatewayProxyResult } from "aws-lambda";
import { IS3 } from "../shared/s3";

type GeneratePresignedUrlServiceOutput = Promise<APIGatewayProxyResult>;

export interface IGeneratePresignedUrlService {
  generate: () => Promise<APIGatewayProxyResult>;
}

export class GeneratePresignedUrlService
  implements IGeneratePresignedUrlService
{
  constructor(private readonly s3: IS3) {}

  async generate(): GeneratePresignedUrlServiceOutput {
    try {
      const preSignedUrl = await this.s3.createPresignedUrl({
        bucket: process.env.BUCKET_NAME as string,
      });

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Api-Key",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
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
