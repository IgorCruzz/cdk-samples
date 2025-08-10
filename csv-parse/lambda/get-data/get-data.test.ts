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

describe("getData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call get data", async () => {
    await service({
      archiveId: "id",
      limit: 10,
      page: 1,
    });

    expect(dataRepository.get).toHaveBeenCalledWith({
      archiveId: "id",
      limit: 10,
      page: 1,
    });
  });

  it("should return data on success", async () => {
    const svc = await service({
      archiveId: "id",
      limit: 10,
      page: 1,
    });

    expect(svc).toEqual({
      count: 1,
      itens: [{ id: "mocked-id", name: "mocked-name" }],
      limit: 10,
      page: 1,
      totalPages: 1,
    });
  });
});
