import { userRepository, Users } from "../_shared/repository/user.repository";
import { Output } from "../_shared/service/output";
import { cognito } from "../_shared/infra/cognito";

type SignUpInput = Users;

export const service = async (data: SignUpInput): Output => {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    return { message: "Email already exists", success: false, data: null };
  }

  const authUser = await cognito.signUp(data.email, data.password);

  await userRepository.save({ ...data, sub: authUser.UserSub });

  return { message: "User created successfully", success: true, data: null };
};
