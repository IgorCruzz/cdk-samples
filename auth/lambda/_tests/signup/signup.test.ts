import { service } from "../../signup/signup.services";
import { cognito } from "../../_shared/infra/cognito";
import { userRepository } from "../../_shared/repository/user.repository";

jest.mock("../../_shared/repository/user.repository", () => ({
  userRepository: {
    findByEmail: jest.fn().mockResolvedValue({
      id: "existing-user-id",
      name: "Existing User",
      email: "existing@example.com",
      providers: {
        cognito: "existing-sub",
        google: null,
      },
    }),
    save: jest.fn(),
  },
}));

jest.mock("../../_shared/infra/cognito", () => ({
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
    jest.spyOn(userRepository, "findByEmail").mockResolvedValue(null);

    await service({
      email: "existing@example.com",
      password: "password123",
      name: "Existing User",
    });

    expect(cognito.signUp).toHaveBeenCalledWith(
      "existing@example.com",
      "password123"
    );
  });
});
