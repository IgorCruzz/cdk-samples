import { service } from "./create-users.services";
import { cognito } from "../_shared/infra/cognito";
import { userRepository } from "../_shared/repository/user.repository";

jest.mock("../_shared/infra/cognito", () => ({
  cognito: {
    removeUser: jest.fn(),
    createUser: jest.fn().mockResolvedValue({
      UserConfirmed: false,
      CodeDeliveryDetails: {
        AttributeName: "email",
        DeliveryMedium: "EMAIL",
        Destination: "email",
      },
    }),
  },
}));
jest.mock("../_shared/repository/user.repository", () => ({
  userRepository: {
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

describe("Create Users Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call findByEmail", async () => {
    await service({
      email: "user1@example.com",
      password: "password",
      name: "Name",
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      "user1@example.com"
    );
  });

  it("throw an error if email already exists", async () => {
    const svc = await service({
      email: "user1@example.com",
      password: "password",
      name: "Name",
    });

    expect(svc).toEqual({
      message: "Email already exists",
      success: false,
      data: null,
    });
  });
});
