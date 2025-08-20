import { service } from "../get-files/get-files.services";
import { archiveRepository } from "../_shared/repository/archive.repository";

jest.mock("../_shared/repository/archive.repository", () => ({
  archiveRepository: {
    getFiles: jest.fn().mockResolvedValue({
      itens: [
        {
          key: "file-key-1",
          size: 12345,
          message: "File processed",
          status: "COMPLETED",
          lines: 100,
          userId: "user-id-1",
          id: "id-1",
          filename: "file1.csv",
          user: {
            email: "user1@example.com",
          },
        },
      ],
      count: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    }),
  },
}));

const request = {
  limit: 10,
  page: 1,
  sub: "sub",
};

describe("getFiles", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call getFiles", async () => {
    await service(request);

    expect(archiveRepository.getFiles).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      sub: "sub",
    });
  });

  it("should return files on success", async () => {
    const svc = await service(request);

    expect(svc).toEqual({
      itens: [
        {
          key: "file-key-1",
          size: 12345,
          message: "File processed",
          status: "COMPLETED",
          lines: 100,
          userId: "user-id-1",
          id: "id-1",
          filename: "file1.csv",
          user: {
            email: "user1@example.com",
          },
        },
      ],
      count: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });
});
