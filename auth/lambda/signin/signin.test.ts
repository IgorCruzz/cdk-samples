import { service } from "../signin/signin.services";
import { cognito } from "../_shared/infra/cognito";

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

  it("should return error when auth fails", async () => {
    (cognito.auth as jest.Mock).mockResolvedValueOnce({
      error: "Invalid credentials",
      session: "sessionData",
    });

    const response = await service({
      email: "test@example.com",
      password: "password123",
    });

    expect(response).toEqual({
      message: "Invalid credentials",
      success: false,
      data: { session: "sessionData" },
    });
  });

  it("should return success when auth succeeds", async () => {
    const response = await service({
      email: "test@example.com",
      password: "password123",
    });

    expect(response).toEqual({
      message: "Authentication successful",
      success: true,
      data: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        idToken: "idToken",
      },
    });
    expect(cognito.auth).toHaveBeenCalledTimes(1);
  });
});
