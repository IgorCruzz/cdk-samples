import { archiveRepository } from "../_shared/repository/archive.repository";
import { dataRepository } from "../_shared/repository/data.repository";

type Input = {
  data: Record<string, unknown>;
  userId: string;
  endpoint: string;
};

export const service = async ({ data, endpoint, userId }: Input) => {
  const archive = await archiveRepository.getByEndpoint({
    endpoint,
    userId,
  });

  if (!archive) {
    return { message: "Data not found", success: false, data: null };
  }

  await dataRepository.singleSave({ ...data, archiveId: archive.id });

  return { message: "Data created successfully", success: true, data: null };
};
