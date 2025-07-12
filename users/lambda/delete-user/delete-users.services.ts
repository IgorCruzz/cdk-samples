import { userRepository } from "../shared/repository/user.repository";
import { Output } from "../shared/service/output";

export const service = async ({ id }: { id: string }): Output => {
  const verifyUser = await userRepository.findById(id);

  if (!verifyUser) {
    return { message: "User not found", success: false, data: null };
  }

  await userRepository.delete({
    id,
  });

  return { message: "User deleted successfully", success: true, data: null };
};
