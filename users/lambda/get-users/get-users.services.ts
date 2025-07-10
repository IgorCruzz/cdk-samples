import { userRepository, Users } from "../shared/repository/user.repository";

export const service = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<{
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

  return files;
};
