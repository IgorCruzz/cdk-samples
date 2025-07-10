import { userRepository, Users } from "../shared/repository/user.repository";

export const service = async (
  data: Users
): Promise<{
  message: string;
}> => {
  await userRepository.save(data);

  return { message: "User created successfully" };
};
