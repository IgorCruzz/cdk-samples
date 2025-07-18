import { Users } from "../shared/repository/user.repository";
import { Output } from "../shared/service/output"; 
import { cognito } from '../shared/infra/cognito';

type Input = Users;

export const service = async (data: Input): Output<{ 
  accessToken?: string; 
  refreshToken?: string;  
  session?: string;
 }>  => {
  
  const { email, password } = data; 

  const auth = await cognito.auth({
    email,
    password
  })

  if (auth.error) {
    return { message: auth.error, success: false, data: auth.session ? { session: auth?.session } : null   }; 
  } 

  return { message: "Login successful", success: true, data: auth };
};
