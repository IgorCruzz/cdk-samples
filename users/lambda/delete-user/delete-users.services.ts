import { userRepository } from "../shared/repository/user.repository";

export const service = async ({
  id,
}: {
  id: string;
}): Promise<{
  message: string;
}> => {
  const verifyUser = await userRepository.findById(id);

  if (!verifyUser) {
    return { message: "User not found" };
  }

  await userRepository.delete({
    id,
  });

  return { message: "User deleted successfully" };
};
