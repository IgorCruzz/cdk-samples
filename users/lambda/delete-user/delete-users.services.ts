import { userRepository } from "../_shared/repository/user.repository";
import { cognito } from "../_shared/infra/cognito";
import { Output } from "../_shared/service/output";

export const service = async ({ id }: { id: string }): Output => {
  const verifyUser = await userRepository.findById(id);

  if (!verifyUser) {
    return { message: "User not found", success: false, data: null };
  }

  await cognito.removeUser(verifyUser.email);

  await userRepository.delete({
    id,
  });

  return { message: "User deleted successfully", success: true, data: null };
};
