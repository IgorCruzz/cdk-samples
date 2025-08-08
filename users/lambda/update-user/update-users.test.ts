import { service } from "./update-users.services";

describe("Update Users Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", async () => {
    expect(service).toBeDefined();
  });
});
