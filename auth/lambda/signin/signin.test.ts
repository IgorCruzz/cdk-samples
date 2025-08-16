import { service } from "../signin/signin.services";
import { cognito } from "../_shared/infra/cognito";
import { userRepository } from "../_shared/repository/user.repository";

jest.mock("../_shared/infra/cognito", () => ({
  cognito: {
    auth: jest.fn().mockResolvedValue({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
      idToken: "idToken",
    }),
  },
}));

jest.mock("../_shared/repository/user.repository", () => ({
  userRepository: {
    findByEmail: jest.fn().mockResolvedValue({
      id: "1",
      name: "User One",
      email: "user1@example.com",
      password: "hashedpassword",
      createdAt: new Date(),
    }),
    save: jest.fn(),
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

  it("should be able to call findByEmail", async () => {
    await service({
      email: "test@example.com",
      password: "password123",
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith({
      email: "test@example.com",
    });
  });

  it("should be able to return sucess false if user not exists", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce(null);

    const response = await service({
      email: "test@example.com",
      password: "password123",
    });

    expect(response).toEqual({
      message: "Invalid email or password",
      success: false,
      data: null,
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
        user: {
          name: "User One",
        },
      },
    });
    expect(cognito.auth).toHaveBeenCalledTimes(1);
  });
});
