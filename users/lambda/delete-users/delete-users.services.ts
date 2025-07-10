import { userRepository } from "../shared/repository/user.repository";
import { APIGatewayProxyResult } from "aws-lambda";

type DeleteUsersInput = {
  id: string;
};

type DeleteUsersOutput = Promise<APIGatewayProxyResult>;

export const service = async ({ id }: DeleteUsersInput): DeleteUsersOutput => {
  try {
    await userRepository.delete({
      id,
    });

    return {
      statusCode: 204,
      body: "",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Api-Key",
        "Access-Control-Allow-Methods": "DELETE, OPTIONS",
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
        "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      },
    };
  }
};
