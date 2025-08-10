import { service } from "../signup/signup.services";
import { cognito } from "../_shared/infra/cognito";
import { userRepository } from "../_shared/repository/user.repository";

jest.mock("../_shared/repository/user.repository", () => ({
  userRepository: {
    findByEmail: jest.fn().mockResolvedValue(null),
    save: jest.fn(),
  },
}));

jest.mock("../_shared/infra/cognito", () => ({
  cognito: {
    signUp: jest.fn().mockResolvedValue({
      UserSub: "new-user-sub",
      sub: "new-user-sub",
    }),
  },
}));

describe("Signup Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be able to call findByEmail", async () => {
    await service({
      email: "existing@example.com",
      password: "password123",
      name: "Existing User",
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith({
      email: "existing@example.com",
    });
  });

  it("should throw an error if user already exists", async () => {
    jest.spyOn(userRepository, "findByEmail").mockResolvedValueOnce({
      email: "existing@example.com",
      name: "Existing User",
      providers: {
        cognito: "existing-sub",
        google: null,
      },
    });

    const svc = await service({
      email: "existing@example.com",
      password: "password123",
      name: "Existing User",
    });

    expect(svc).toEqual({
      message: "Email already exists",
      success: false,
      data: null,
    });
  });

  it("should call cognito.signUp with correct parameters", async () => {
    await service({
      email: "existing@example.com",
      password: "password123",
      name: "Existing User",
    });

    expect(cognito.signUp).toHaveBeenCalledWith(
      "Existing User",
      "existing@example.com",
      "password123"
    );
  });

  it("should save the user with correct data", async () => {
    await service({
      email: "existing@example.com",
      password: "password123",
      name: "Existing User",
    });

    expect(userRepository.save).toHaveBeenCalledWith({
      name: "Existing User",
      email: "existing@example.com",
      password: "password123",
      providers: {
        cognito: "new-user-sub",
        google: null,
      },
    });
  });

  it("should return success message on successful signup", async () => {
    const svc = await service({
      email: "existing@example.com",
      password: "password123",
      name: "Existing User",
    });

    expect(svc).toEqual({
      message: "User created successfully",
      success: true,
      data: null,
    });
  });
});
