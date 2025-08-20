import { service } from "../get-data/get-data.services";
import { dataRepository } from "../_shared/repository/data.repository";

jest.mock("../_shared/repository/data.repository", () => ({
  dataRepository: {
    get: jest.fn().mockResolvedValue({
      itens: [{ id: "mocked-id", name: "mocked-name" }],
      count: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
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

const request = {
  endpoint: "endpoint",
  userId: "userId",
  limit: 10,
  page: 1,
};

describe("getData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call get data", async () => {
    await service(request);

    expect(dataRepository.get).toHaveBeenCalledWith({
      archiveId: "68a3b89d64b9a8037c97582d",
      limit: 10,
      page: 1,
    });
  });

  it("should return data on success", async () => {
    const svc = await service(request);

    expect(svc).toEqual({
      count: 1,
      itens: [{ id: "mocked-id", name: "mocked-name" }],
      limit: 10,
      page: 1,
      totalPages: 1,
    });
  });
});
