import { userRepository } from "../shared/repository/user.repository";
import { APIGatewayProxyResult } from "aws-lambda";

type GetUsersInput = {
  page: number;
  limit: number;
};

type GetUsersOutput = Promise<APIGatewayProxyResult>;

export const service = async ({
  page,
  limit,
}: GetUsersInput): GetUsersOutput => {
  try {
    const files = await userRepository.getUsers({
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
