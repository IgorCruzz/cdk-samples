import { userRepository, Users } from "../shared/repository/user.repository";
import { Output } from "../shared/service/output";

type CreateUserInput = Users;

export const service = async (data: CreateUserInput): Output => {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    return { message: "Email already exists", success: false, data: null };
  }

  await userRepository.save(data);

  return { message: "User created successfully", success: true, data: null };
};
