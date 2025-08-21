import { archiveRepository } from "../_shared/repository/archive.repository";
import { dataRepository } from "../_shared/repository/data.repository";
import { dbHelper } from "../_shared/repository/db-helper";

type Input = {
  archiveId: string;
};

export const service = async ({ archiveId }: Input) => {
  const client = dbHelper.getClient();
  const session = client.startSession();

  const archive = await archiveRepository.getFileById({ id: archiveId });

  if (!archive) {
    return {
      message: "Api does not exists",
      success: false,
      data: null,
    };
  }

  await session.withTransaction(async () => {
    await archiveRepository.delete({ id: archiveId, session });
    await dataRepository.deleteMany({ archiveId: archive.id!, session });
  });

  await session.endSession();

  return {
    message: "Api deleted successfully",
    success: true,
    data: null,
  };
};
