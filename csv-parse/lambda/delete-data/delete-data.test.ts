import { service } from "../delete-data/delete-data.services";
import { dataRepository } from "../_shared/repository/data.repository";

jest.mock("../_shared/repository/data.repository", () => ({
  dataRepository: {
    delete: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("deleteData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call delete", async () => {
    await service({ id: "awesome-id" });
  });

  expect(dataRepository.delete).toHaveBeenCalledWith({ id: "awesome-id" });
});
