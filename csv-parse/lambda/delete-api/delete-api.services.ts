import { archiveRepository } from "../_shared/repository/archive.repository";

type Input = {
  archiveId: string;
};

export const service = async ({ archiveId }: Input) => {
  const archive = await archiveRepository.getFileById({ id: archiveId });

  if (!archive) {
    return {
      message: "Api does not exists",
      success: false,
      data: null,
    };
  }

  return {
    message: "Api deleted successfully",
    success: true,
    data: null,
  };
};
