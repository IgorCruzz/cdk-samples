import { APIGatewayRequestAuthorizerEventV2} from "aws-lambda";
import { service } from "./authorizer.services";  

export const handler = async (
  event: APIGatewayRequestAuthorizerEventV2
): Promise<
{
  isAuthorized?: boolean;
  context?: Record<string, any>;  
  errorMessage?: string;
}> => {
  try {  
    const token = event.headers?.authorization || event.headers?.Authorization; 
    
    const response = await service({ token });

    if (!response.success) {
      return { errorMessage : "Unauthorized"}
    }

    return {
       isAuthorized: true,
    };
  } catch (error) {
    console.error("Error:", error);
    return { errorMessage : "Unauthorized"}
}
};
