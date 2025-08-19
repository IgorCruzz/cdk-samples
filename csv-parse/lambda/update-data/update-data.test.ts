import { service } from "../add-data/add-data.services";
import { dataRepository } from "../_shared/repository/data.repository";

jest.mock("../_shared/repository/data.repository");

describe("UpdateData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });
});
