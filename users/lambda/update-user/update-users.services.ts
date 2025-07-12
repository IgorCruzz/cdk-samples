import { userRepository, Users } from "../shared/repository/user.repository";
import { Output } from "../shared/service/output";

export const service = async (data: Users): Output => {
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
