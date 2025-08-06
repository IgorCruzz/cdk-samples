import { service } from "../../signin/signin.services";
import { cognito } from "../../_shared/infra/cognito";

jest.mock("../../_shared/infra/cognito", () => ({
  cognito: {
    auth: jest.fn().mockResolvedValue({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
      idToken: "idToken",
    }),
  },
}));

describe("signin services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be able to call auth", async () => {
    await service({
      email: "test@example.com",
      password: "password123",
    });

    expect(cognito.auth).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });
});
