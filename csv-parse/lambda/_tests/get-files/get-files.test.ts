import { service } from "../../get-files/get-files.services";
import { archiveRepository } from "../../_shared/repository/archive.repository";

jest.mock("../../_shared/repository/archive.repository", () => ({
  archiveRepository: {
    getFiles: jest.fn().mockResolvedValue({
      key: "key",
      size: 0,
      message: "message",
      status: "PROCESSING",
      lines: 0,
      userId: "userId",
      id: "id",
      filename: "filename",
      user: {
        email: "email@mail.com",
      },
    }),
    updateStatus: jest.fn(),
  },
}));

describe("getFiles", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call getFiles", async () => {
    await service({
      limit: 10,
      page: 1,
      sub: "sub",
    });

    expect(archiveRepository.getFiles).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      sub: "sub",
    });
  });
});
