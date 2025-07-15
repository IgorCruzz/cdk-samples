import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import { service } from "./authorizer.services";  

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  try {  
    const token = event.authorizationToken 
    
    const response = await service({ token });

    return {
      principalId: "authorizer",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: response.success ? "Allow" : "Deny",
            Resource: event.methodArn,
          },
        ],
      }
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      principalId: "authorizer",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: event.methodArn,
          },
        ],
      }
  }
}
};
