import { archiveRepository } from "../shared/repository/archive.repository";
import { APIGatewayProxyResult } from "aws-lambda";

export const service = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<APIGatewayProxyResult> => {
  try {
    const files = await archiveRepository.getFiles({
      page,
      limit,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(files),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Api-Key",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    };
  } catch (error) {
    console.log({ error });

    return {
      statusCode: 500,
      body: "Internal Server Error",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Api-Key",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    };
  }
};
