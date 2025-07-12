import { userRepository, Users } from "../shared/repository/user.repository";

export const service = async (data: Users): Promise<{ message: string }> => {
  const verifyEmail = await userRepository.findByEmail(data.email);

  if (verifyEmail && verifyEmail.id !== data.id) {
    return { message: "Email already exists" };
  }

  await userRepository.update(data);

  return { message: "User updated successfully" };
};
