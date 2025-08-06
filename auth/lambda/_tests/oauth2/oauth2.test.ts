import { service } from "../../oauth2/oauth2.services";
import { cognito } from "../../_shared/infra/cognito";
import { jwt } from "../../_shared/infra/jwt";
import { userRepository } from "../../_shared/repository/user.repository";

jest.mock("../../_shared/infra/cognito", () => ({
  cognito: {
    getToken: jest.fn(),
  },
}));

jest.mock("../../_shared/infra/jwt", () => ({
  jwt: {
    decode: jest.fn(),
  },
}));

jest.mock("../../_shared/repository/user.repository", () => ({
  userRepository: {
    findByEmail: jest.fn(),
    save: jest.fn(),
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

  it("should be able to call decoded", async () => {
    (jwt.decode as jest.Mock).mockResolvedValue({ email: "test@example.com" });

    (cognito.getToken as jest.Mock).mockResolvedValue({
      accessToken: "mockAccessToken",
      refreshToken: "mockRefreshToken",
      idToken: "mockIdToken",
    });

    await service({
      code: "test-code",
    });

    expect(jwt.decode).toHaveBeenCalledWith({ token: "mockIdToken" });
  });

  it("should be able to call findByEmail with decoded email", async () => {
    (jwt.decode as jest.Mock).mockReturnValue({ email: "test@example.com" });

    await service({
      code: "test-code",
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith({
      email: "test@example.com",
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
