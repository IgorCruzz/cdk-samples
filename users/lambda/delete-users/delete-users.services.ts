import { userRepository } from "../shared/repository/user.repository";

export const service = async ({ id }: { id: string }): Promise<void> => {
  await userRepository.delete({
    id,
  });
};
