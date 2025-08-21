import { service } from "../delete-api/delete-api.services";
import { archiveRepository } from "../_shared/repository/archive.repository";
import { dataRepository } from "../_shared/repository/data.repository";

jest.mock("../_shared/repository/db-helper", () => ({
  dbHelper: {
    getClient: jest.fn(() => ({
      startSession: jest.fn(() => ({
        withTransaction: jest.fn(async (fn) => {
          await fn();
        }),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      })),
    })),
  },
}));

jest.mock("../_shared/repository/data.repository", () => ({
  dataRepository: {
    deleteMany: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../_shared/repository/archive.repository", () => ({
  archiveRepository: {
    delete: jest.fn().mockResolvedValue(undefined),
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

describe("deleteApi", () => {
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
    (archiveRepository.getFileById as jest.Mock).mockResolvedValueOnce(null);

    const svc = await service(request);

    expect(svc).toEqual({
      message: "Api does not exists",
      success: false,
      data: null,
    });
  });

  it("should be able to call delete", async () => {
    await service(request);

    expect(archiveRepository.delete).toHaveBeenCalledWith({
      id: "id",
      session: expect.any(Object),
    });
  });

  it("should be able to call deleteMany", async () => {
    await service(request);

    expect(dataRepository.deleteMany).toHaveBeenCalledWith({
      archiveId: "id",
      session: expect.any(Object),
    });
  });

  it("should return success true if api was deleted succesfully", async () => {
    const svc = service(request);

    expect(svc).toEqual({
      message: "Api deleted successfully",
      success: true,
      data: null,
    });
  });
});
