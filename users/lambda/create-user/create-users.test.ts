import { service } from "./create-users.services";
import { cognito } from "../_shared/infra/cognito";
import { userRepository } from "../_shared/repository/user.repository";

jest.mock("../_shared/infra/cognito", () => ({
  cognito: {
    removeUser: jest.fn(),
    createUser: jest.fn().mockResolvedValue({
      UserSub: "UserSub",
    }),
  },
}));
jest.mock("../_shared/repository/user.repository", () => ({
  userRepository: {
    save: jest.fn(),
    findByEmail: jest.fn().mockResolvedValue([
      {
        id: "1",
        name: "User One",
        email: "user1@example.com",
        password: "hashedpassword",
        createdAt: new Date(),
      },
    ]),
  },
}));

const request = {
  email: "user1@example.com",
  password: "password",
  name: "Name",
};

describe("Create Users Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call findByEmail", async () => {
    await service(request);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      "user1@example.com"
    );
  });

  it("throw an error if email already exists", async () => {
    const svc = await service(request);

    expect(svc).toEqual({
      message: "Email already exists",
      success: false,
      data: null,
    });
  });

  it("should be able to createUser", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce(undefined);

    await service(request);

    expect(cognito.createUser).toHaveBeenCalledWith(
      "user1@example.com",
      "password"
    );
  });

  it("should be able to save user", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce(undefined);

    await service(request);

    expect(userRepository.save).toHaveBeenCalledWith({
      email: "user1@example.com",
      password: "password",
      name: "Name",
      sub: expect.any(String),
    });
  });

  it("should return success message when user is created", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce(undefined);

    const svc = await service(request);

    expect(svc).toEqual({
      message: "User created successfully",
      success: true,
      data: null,
    });
  });
});
