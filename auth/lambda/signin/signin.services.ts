import { Users } from "../shared/repository/user.repository";
import { Output } from "../shared/service/output"; 
import { cognito } from '../shared/infra/cognito';

type SigninInput = Users;

export const service = async (data: SigninInput): Output<{ 
  accessToken: string; 
  refreshToken: string; 
 }>  => {
  
  const { email, password } = data; 

  const auth = await cognito.auth({
    email,
    password
  })

  if (!auth) {
    return { message: "Invalid credentials", success: false, data: null }; 
  } 

  return { message: "Login successful", success: true, data: auth };
};
