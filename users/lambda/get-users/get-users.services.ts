import { userRepository, Users } from "../shared/repository/user.repository";
import { Output } from "../shared/service/output";

export const service = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Output<{
  itens: Users[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const files = await userRepository.getUsers({
    page,
    limit,
  });

  return {
    message: "Users retrieved successfully",
    data: files,
    success: true,
  };
};
