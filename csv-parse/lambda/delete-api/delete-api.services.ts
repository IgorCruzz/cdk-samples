import { archiveRepository } from "../_shared/repository/archive.repository";
import { dataRepository } from "../_shared/repository/data.repository";
import { dbHelper } from "../_shared/repository/db-helper";

type Input = {
  archiveId: string;
};

export const service = async ({ archiveId }: Input) => {
  const client = dbHelper.getClient();
  const session = client.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const archive = await archiveRepository.getFileById({ id: archiveId });

      if (!archive) {
        result = {
          message: "Api does not exists",
          success: false,
          data: null,
        };

        await session.abortTransaction();
        return;
      }

      await archiveRepository.delete({ id: archiveId, session });
      await dataRepository.deleteMany({ archiveId: archive.id!, session });

      result = {
        message: "Api deleted successfully",
        success: true,
        data: null,
      };
    });

    return result;
  } catch (err) {
    console.error("Error during transaction:", err);

    try {
      await session.abortTransaction();
    } catch (abortErr) {
      console.error("Failed to abort transaction:", abortErr);
    }

    return {
      message: "Internal server error",
      success: false,
      data: null,
    };
  } finally {
    session.endSession();
  }
};
