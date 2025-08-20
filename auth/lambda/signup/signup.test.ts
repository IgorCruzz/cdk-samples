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

const request = {
  email: "existing@example.com",
  password: "password123",
  firstName: "Foo",
  lastName: "Bar",
};

describe("Signup Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be able to call findByEmail", async () => {
    await service(request);

    expect(userRepository.findByEmail).toHaveBeenCalledWith({
      email: "existing@example.com",
    });
  });

  it("should throw an error if user already exists", async () => {
    jest.spyOn(userRepository, "findByEmail").mockResolvedValueOnce({
      email: "existing@example.com",
      firstName: "Foo",
      lastName: "Bar",
      providers: {
        cognito: "existing-sub",
        google: null,
      },
    });

    const svc = await service(request);

    expect(svc).toEqual({
      message: "Email already exists",
      success: false,
      data: null,
    });
  });

  it("should call cognito.signUp with correct parameters", async () => {
    await service(request);

    expect(cognito.signUp).toHaveBeenCalledWith(
      "Foo",
      "Bar",
      "existing@example.com",
      "password123"
    );
  });

  it("should save the user with correct data", async () => {
    await service(request);

    expect(userRepository.save).toHaveBeenCalledWith({
      firstName: "Foo",
      lastName: "Bar",
      email: "existing@example.com",
      password: "password123",
      providers: {
        cognito: "new-user-sub",
        google: null,
      },
    });
  });

  it("should return success message on successful signup", async () => {
    const svc = await service(request);

    expect(svc).toEqual({
      message: "User created successfully",
      success: true,
      data: null,
    });
  });
});
