import { userRepository, Users } from "../shared/repository/user.repository";

type CreateUserInput = Users;

export const service = async (
  data: CreateUserInput
): Promise<{ message: string }> => {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new Error("Email is already in use");
  }

  await userRepository.save(data);

  return { message: "User created successfully" };
};
