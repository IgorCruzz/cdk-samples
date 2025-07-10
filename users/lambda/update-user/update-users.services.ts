import { userRepository, Users } from "../shared/repository/user.repository";

export const service = async (data: Users): Promise<void> => {
  await userRepository.update(data);
};
