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

const request = {
  limit: 10,
  page: 1,
};

describe("Get Users Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call getUsers", async () => {
    await service(request);

    expect(userRepository.getUsers).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
    });
  });

  it("should be able to return sucess", async () => {
    const svc = await service(request);

    expect(svc).toEqual({
      message: "Users retrieved successfully",
      success: true,
      data: [
        {
          id: "1",
          name: "User One",
          email: "user1@example.com",
          password: "hashedpassword",
          createdAt: expect.any(Date),
        },
      ],
    });
  });
});
