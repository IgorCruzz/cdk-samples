import { userRepository, Users } from "../shared/repository/user.repository";
import { Output } from "../shared/service/output";
import { jwt } from '../shared/infra/jwt';

type SigninInput = Users;

export const service = async (data: SigninInput): Output<{ 
  accessToken: string; 
  refreshToken: string; 
 }>  => {
  
  const { email, password } = data;
  
  const validateUser = await userRepository.validatePassword(email, password);
  
  if (!validateUser) {
    return { message: "Email or password is incorrect", success: false, data: null };
  }

  const tokens = await jwt.sign({ email });

  return { message: "Login successful", success: true, data: {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  } };
};
