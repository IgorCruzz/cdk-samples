import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./oauth2.services";
import { internal } from "../shared/http/500";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const data = event.queryStringParameters?.code;

    if (!data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Code is required" }),
      };
    }

    const response = await service({
      code: data,
    });

    if (!response.success) {
      return {
        statusCode: 400,
        body: JSON.stringify(response),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error:", error);
    return internal();
  }
};
