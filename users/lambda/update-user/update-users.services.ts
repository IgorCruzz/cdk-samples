import { userRepository } from "../_shared/repository/user.repository";
import { Output } from "../_shared/service/output";

type Input = {
  id: string;
  email: string;
  name: string;
};

export const service = async (data: Input): Output => {
  const verifyUser = await userRepository.findById(data.id);

  if (!verifyUser) {
    return { message: "User not found", success: false, data: null };
  }

  const verifyEmail = await userRepository.findByEmail(data.email);

  if (verifyEmail && verifyEmail.id !== data.id) {
    return { message: "Email already exists", success: false, data: null };
  }

  await userRepository.update(data);

  return { message: "User updated successfully", success: true, data: null };
};
