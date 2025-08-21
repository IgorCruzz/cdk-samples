import { service } from "../delete-api/delete-api.services";
import { archiveRepository } from "../_shared/repository/archive.repository";

jest.mock("../_shared/repository/archive.repository", () => ({
  archiveRepository: {
    getFileById: jest.fn().mockResolvedValue({
      key: "key",
      size: 0,
      message: "message",
      status: "PROCESSING",
      lines: 0,
      userId: "userId",
      id: "id",
      filename: "filename",
    }),
  },
}));

const request = {
  archiveId: "some-archive-id",
};

describe("deleteData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call getFileById", async () => {
    await service(request);

    expect(archiveRepository.getFileById).toHaveBeenCalledWith({
      id: "some-archive-id",
    });
  });

  it("should return success false when archive does not exists", async () => {
    const svc = await service(request);

    expect(svc).toEqual({
      message: "Api does not exists",
      success: false,
      data: null,
    });
  });
});
