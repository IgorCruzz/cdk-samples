import { userRepository } from "../_shared/repository/user.repository";
import { service } from "./update-users.services";

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
    update: jest.fn(),
    findByEmail: jest.fn().mockResolvedValue({
      id: "1",
      name: "User One",
      email: "user1@example.com",
      password: "hashedpassword",
      createdAt: new Date(),
    }),
  },
}));

const request = {
  name: "User One",
  email: "user1@example.com",
  id: "1",
};

describe("Update Users Service", () => {
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

  it("should return success false when user does not exists", async () => {
    (userRepository.findById as jest.Mock).mockResolvedValueOnce(null);

    const result = await service(request);

    expect(result).toEqual({
      message: "User not found",
      success: false,
      data: null,
    });
  });

  it("should be able to call findByEmail", async () => {
    await service(request);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      "user1@example.com"
    );
  });

  it("should return success false when email already exists", async () => {
    const result = await service({
      name: "User One",
      email: "user1@example.com",
      id: "anotherId",
    });

    expect(result).toEqual({
      message: "Email already exists",
      success: false,
      data: null,
    });
  });

  it("should be able to call update", async () => {
    await service(request);

    expect(userRepository.update).toHaveBeenCalledWith({
      id: "1",
      name: "User One",
      email: "user1@example.com",
    });
  });

  it("should return success with user was updated", async () => {
    const result = await service(request);

    expect(result).toEqual({
      message: "User updated successfully",
      success: true,
      data: null,
    });
  });
});
