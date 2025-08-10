import { service } from "../oauth2/oauth2.services";
import { cognito } from "../_shared/infra/cognito";
import { jwt } from "../_shared/infra/jwt";
import { userRepository } from "../_shared/repository/user.repository";

jest.mock("../_shared/infra/cognito", () => ({
  cognito: {
    getToken: jest.fn(),
  },
}));

jest.mock("../_shared/infra/jwt", () => ({
  jwt: {
    decode: jest.fn(),
  },
}));

jest.mock("../_shared/repository/user.repository", () => ({
  userRepository: {
    findByEmail: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
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
    (jwt.decode as jest.Mock).mockResolvedValue({
      email: "test@example.com",
      given_name: "Foo",
      family_name: "Bar",
      sub: "c4386438-6051-70b8-e5b6-94553c68677f",
    });

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
    (jwt.decode as jest.Mock).mockReturnValue({
      email: "test@example.com",
      given_name: "Foo",
      family_name: "Bar",
      sub: "c4386438-6051-70b8-e5b6-94553c68677f",
    });

    await service({
      code: "test-code",
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith({
      email: "test@example.com",
    });
  });

  it("should be able to call save if user not found", async () => {
    (jwt.decode as jest.Mock).mockReturnValue({
      email: "test@example.com",
      given_name: "Foo",
      family_name: "Bar",
      sub: "c4386438-6051-70b8-e5b6-94553c68677f",
    });
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await service({
      code: "test-code",
    });

    expect(userRepository.save).toHaveBeenCalledWith({
      email: "test@example.com",
      providers: {
        cognito: null,
        google: "c4386438-6051-70b8-e5b6-94553c68677f",
      },
      name: "Foo Bar",
    });
  });

  it("should be able to call update user", async () => {
    (cognito.getToken as jest.Mock).mockResolvedValue({
      accessToken: "mockAccessToken",
      refreshToken: "mockRefreshToken",
      idToken: "mockIdToken",
    });

    (userRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: "user-id",
      name: "Existing User",
      email: "test@example.com",
      providers: {
        cognito: "some-cognito-id",
        google: null,
      },
    });

    await service({
      code: "test-code",
    });

    expect(userRepository.update).toHaveBeenCalled();
  });

  it("should return success message and tokens on successful login", async () => {
    (cognito.getToken as jest.Mock).mockResolvedValue({
      accessToken: "mockAccessToken",
      refreshToken: "mockRefreshToken",
      idToken: "mockIdToken",
    });

    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

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
