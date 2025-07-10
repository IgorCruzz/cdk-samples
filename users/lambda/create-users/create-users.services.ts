import { userRepository, Users } from "../shared/repository/user.repository";
import { APIGatewayProxyResult } from "aws-lambda";

export const service = async (data: Users): Promise<APIGatewayProxyResult> => {
  try {
    const files = await userRepository.save(data);

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
