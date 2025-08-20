import { archiveRepository } from "../_shared/repository/archive.repository";
import { dataRepository } from "../_shared/repository/data.repository";

type Input = {
  data: Record<string, unknown>;
  userId: string;
  endpoint: string;
  dataId: string;
};

export const service = async ({ data, endpoint, userId, dataId }: Input) => {
  const archive = await archiveRepository.getByEndpoint({
    endpoint,
    userId,
  });

  if (!archive) {
    return { message: "Api not found", success: false, data: null };
  }

  await dataRepository.updateData({ data, id: dataId });

  return { message: "Data updated successfully", success: true, data: null };
};
