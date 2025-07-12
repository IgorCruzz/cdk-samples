import { userRepository, Users } from "../shared/repository/user.repository";

export const service = async (data: Users): Promise<{ message: string }> => {
  const verifyUser = await userRepository.findById(data.id);

  if (!verifyUser) {
    return { message: "User not found" };
  }

  const verifyEmail = await userRepository.findByEmail(data.email);

  if (verifyEmail && verifyEmail.id !== data.id) {
    return { message: "Email already exists" };
  }

  await userRepository.update(data);

  return { message: "User updated successfully" };
};
