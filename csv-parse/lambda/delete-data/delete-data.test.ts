import { service } from "../get-data/get-data.services";
import { dataRepository } from "../_shared/repository/data.repository";

describe("deleteData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });
});
