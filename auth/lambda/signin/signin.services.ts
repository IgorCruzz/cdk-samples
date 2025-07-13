import { userRepository, Users } from "../shared/repository/user.repository";
import { Output } from "../shared/service/output";

type SigninInput = Users;

export const service = async (data: SigninInput): Output => {
  
  const { email, password } = data;
  
  const validateUser = await userRepository.validatePassword(email, password);
  
  if (!validateUser) {
    return { message: "Email or password is incorrect", success: false, data: null };
  }

  return { message: "Login successful", success: true, data: null };
};
