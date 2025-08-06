import { service } from "../../oauth2/oauth2.services";
import { cognito } from "../../_shared/infra/cognito";

jest.mock("../../_shared/infra/cognito", () => ({
  cognito: {
    getToken: jest.fn(),
  },
}));

describe("OAuth2 Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be able to call getToken", async () => {
    (cognito.getToken as jest.Mock).mockResolvedValue({
      accessToken: null,
      refreshToken: null,
      idToken: null,
    });

    await service({
      code: "test-code",
    });

    expect(cognito.getToken).toHaveBeenCalledWith({
      code: "test-code",
    });
  });

  it("should return success message and tokens on successful login", async () => {
    (cognito.getToken as jest.Mock).mockResolvedValue({
      accessToken: "mockAccessToken",
      refreshToken: "mockRefreshToken",
      idToken: "mockIdToken",
    });

    const response = await service({
      code: "test-code",
    });

    expect(response).toEqual({
      message: "Login successful",
      success: true,
      data: {
        accessToken: "mockAccessToken",
        refreshToken: "mockRefreshToken",
        idToken: "mockIdToken",
      },
    });
  });
});
