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
});
