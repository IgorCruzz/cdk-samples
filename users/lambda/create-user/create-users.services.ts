import { userRepository, Users } from "../shared/repository/user.repository";
import { Output } from "../shared/service/output";
import { cognito } from "../shared/infra/cognito";

type CreateUserInput = Users;

export const service = async (data: CreateUserInput): Output => {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    return { message: "Email already exists", success: false, data: null };
  }

  const authUser = await cognito.createAuthUser(data.email, data.password);

  await userRepository.save({ ...data, sub: authUser.UserSub });

  return { message: "User created successfully", success: true, data: null };
};
