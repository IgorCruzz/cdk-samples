import { APIGatewayProxyResult } from "aws-lambda";
import { s3 } from "../shared/infra/s3";

export const service = async (): Promise<APIGatewayProxyResult> => {
  try {
    const preSignedUrl = await s3.createPresignedUrl({
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
};
