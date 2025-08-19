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

describe("deleteData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call findById", async () => {
    await service({ id: "awesome-id" });

    expect(dataRepository.delete).toHaveBeenCalledWith({ id: "awesome-id" });
  });

  it("should return success false if data not found", async () => {
    (dataRepository.findById as jest.Mock).mockResolvedValueOnce(null);

    const svc = await service({ id: "awesome-id" });

    expect(svc).toEqual({
      message: "Data not found",
      success: false,
      data: null,
    });
  });

  it("should be able to call delete", async () => {
    await service({ id: "awesome-id" });

    expect(dataRepository.delete).toHaveBeenCalledWith({ id: "awesome-id" });
  });

  it("should return success if data was deleted", async () => {
    const svc = await service({ id: "awesome-id" });

    expect(svc).toEqual({
      message: "Data deleted successfully",
      success: true,
      data: null,
    });
  });
});
