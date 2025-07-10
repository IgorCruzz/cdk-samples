import { userRepository, Users } from "../shared/repository/user.repository";
import { APIGatewayProxyResult } from "aws-lambda";

type UpdateUsersInput = Users;

type UpdateUsersOutput = Promise<APIGatewayProxyResult>;

export const service = async (data: UpdateUsersInput): UpdateUsersOutput => {
  try {
    const files = await userRepository.update(data);

    return {
      statusCode: 201,
      body: JSON.stringify(files),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Api-Key",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    };
  }
};
