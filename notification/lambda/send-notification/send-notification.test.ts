import { service } from "./notifier-send.service";

describe("sendNotification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", async () => {
    expect(service).toBeDefined();
  });
});
