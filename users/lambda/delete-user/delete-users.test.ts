import { userRepository } from "../_shared/repository/user.repository";
import { service } from "./delete-users.services";

jest.mock("../_shared/repository/user.repository", () => ({
  userRepository: {
    delete: jest.fn(),
    findById: jest.fn().mockResolvedValue([
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

jest.mock("../_shared/infra/cognito", () => ({
  cognito: {
    removeUser: jest.fn(),
  },
}));

describe("Delete Users Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call findById", async () => {
    await service({ id: "1" });

    expect(userRepository.findById).toHaveBeenCalledWith("1");
  });
});
