import { service } from "../delete-data/delete-data.services";
import { dataRepository } from "../_shared/repository/data.repository";

jest.mock("../_shared/repository/data.repository", () => ({
  dataRepository: {
    delete: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn().mockResolvedValue({
      id: "awesome-id",
      name: "Awesome Data",
    }),
  },
}));

jest.mock("../_shared/repository/archive.repository", () => ({
  archiveRepository: {
    getByEndpoint: jest.fn().mockResolvedValue({
      key: "file-key-1",
      size: 12345,
      endpoint: "endpoint",
      message: "File processed",
      status: "COMPLETED",
      userId: "user-id-1",
      id: "68a3b89d64b9a8037c97582d",
      filename: "file1.csv",
    }),
  },
}));

const request = { id: "awesome-id", endpoint: "endpoint", userId: "userId" };

describe("deleteData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call findById", async () => {
    await service(request);

    expect(dataRepository.delete).toHaveBeenCalledWith({ id: "awesome-id" });
  });

  it("should return success false if data not found", async () => {
    (dataRepository.findById as jest.Mock).mockResolvedValueOnce(null);

    const svc = await service(request);

    expect(svc).toEqual({
      message: "Data not found",
      success: false,
      data: null,
    });
  });

  it("should be able to call delete", async () => {
    await service(request);

    expect(dataRepository.delete).toHaveBeenCalledWith({ id: "awesome-id" });
  });

  it("should return success if data was deleted", async () => {
    const svc = await service(request);

    expect(svc).toEqual({
      message: "Data deleted successfully",
      success: true,
      data: null,
    });
  });
});
