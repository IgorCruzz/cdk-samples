import { APIGatewayRequestAuthorizerEventV2} from "aws-lambda";
import { service } from "./authorizer.services";  

export const handler = async (
  event: APIGatewayRequestAuthorizerEventV2
): Promise<
{
  isAuthorized: boolean;
  context?: Record<string, any>;  
}> => {
  try {  
    const token = event.headers?.Authorization  
    
    const response = await service({ token });

    return {
       isAuthorized: response.success,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      isAuthorized: false
  }
}
};
