import { jwt } from '../shared/infra/jwt';
import { Output } from "../shared/service/output";

type AuthorizerInput = {
  token: string;
};

export const service = async (data: AuthorizerInput): Output<{ 
  token: string;   
}> => {
  const { token } = data;

  if (!token || !token.startsWith("Bearer ")) {
      return {
        message: "Invalid or missing token",
        success: false,
        data: null
      }
    }

    const jwtToken = token.split(" ")[1];

    const decoded = await jwt.verify(jwtToken, 'access');

    if (!decoded) {
      return {
        message: "Invalid or missing token",
        success: false,
        data: null
      }
    }

    return {
      message: "Token is valid",
      success: true,
      data: null,
    }   
};
