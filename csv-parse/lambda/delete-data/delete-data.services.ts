import { archiveRepository } from "../_shared/repository/archive.repository";
import { dataRepository } from "../_shared/repository/data.repository";

export const service = async ({
  id,
  userId,
  endpoint,
}: {
  id: string;
  userId: string;
  endpoint: string;
}) => {
  const archive = await archiveRepository.getByEndpoint({
    endpoint,
    userId,
  });

  if (!archive) {
    return { message: "endpoint not found", success: false, data: null };
  }

  const data = (await dataRepository.findById({ id })) as { archiveId: string };

  if (!data) {
    return { message: "Data not found", success: false, data: null };
  }

  if (data.archiveId !== archive.id) {
    return {
      message: "Data does not exists",
      success: false,
      data: null,
    };
  }

  await dataRepository.delete({ id });

  return {
    message: "Data deleted successfully",
    success: true,
    data: null,
  };
};
