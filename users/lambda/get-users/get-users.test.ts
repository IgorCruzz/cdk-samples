import { service } from "./get-users.services";
import { userRepository } from "../_shared/repository/user.repository";

jest.mock("../_shared/repository/user.repository", () => ({
  userRepository: {
    getUsers: jest.fn().mockResolvedValue([
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

describe("Get Users Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call getUsers", async () => {
    await service({
      limit: 10,
      page: 1,
    });

    expect(userRepository.getUsers).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
    });
  });
});
