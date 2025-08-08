import { userRepository } from "../_shared/repository/user.repository";
import { Output } from "../_shared/service/output";
import { cognito } from "../_shared/infra/cognito";

type CreateUserInput = {
  email: string;
  password: string;
  name: string;
};

export const service = async (data: CreateUserInput): Output => {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    return { message: "Email already exists", success: false, data: null };
  }

  const authUser = await cognito.createUser(data.email, data.password);

  await userRepository.save({ ...data, sub: authUser.UserSub });

  return { message: "User created successfully", success: true, data: null };
};
