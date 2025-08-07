import { service } from "../../get-data/get-data.services";
import { dataRepository } from "../../_shared/repository/data.repository";

jest.mock("../../_shared/repository/data.repository", () => ({
  dataRepository: {
    save: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("getData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });
});
