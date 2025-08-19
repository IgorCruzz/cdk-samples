import { service } from "../delete-data/delete-data.services";
import { dataRepository } from "../_shared/repository/data.repository";

describe("createData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });
});
