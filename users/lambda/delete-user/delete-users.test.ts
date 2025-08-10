import { cognito } from "../_shared/infra/cognito";
import { userRepository } from "../_shared/repository/user.repository";
import { service } from "./delete-users.services";

jest.mock("../_shared/repository/user.repository", () => ({
  userRepository: {
    delete: jest.fn(),
    findById: jest.fn().mockResolvedValue({
      id: "1",
      name: "User One",
      email: "user1@example.com",
      password: "hashedpassword",
      createdAt: new Date(),
    }),
  },
}));

jest.mock("../_shared/infra/cognito", () => ({
  cognito: {
    removeUser: jest.fn(),
  },
}));

const request = {
  id: "1",
};

describe("Delete Users Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call findById", async () => {
    await service(request);

    expect(userRepository.findById).toHaveBeenCalledWith("1");
  });

  it("should throw an error if user is not found", async () => {
    (userRepository.findById as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await service(request);

    expect(result).toEqual({
      message: "User not found",
      success: false,
      data: null,
    });
  });

  it("should be able to call removeUser", async () => {
    await service(request);

    expect(cognito.removeUser).toHaveBeenCalledWith("user1@example.com");
  });

  it("should be able to call delete", async () => {
    await service(request);

    expect(userRepository.delete).toHaveBeenCalledWith({ id: "1" });
  });
});
