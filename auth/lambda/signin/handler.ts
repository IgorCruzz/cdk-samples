import { APIGatewayProxyEvent } from "aws-lambda";
import { service } from "./signin.services";
import { internal } from "../shared/http/500";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const data = JSON.parse(event.body || "{}");

    const response = await service(data);

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
