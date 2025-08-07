import { service } from "../../generate-presigned-url/generate-presigned-url.service";
import { archiveRepository } from "../../_shared/repository/archive.repository";
import { userRepository } from "../../_shared/repository/user.repository";

jest.mock("../../_shared/repository/archive.repository", () => ({
  archiveRepository: {
    getFileByKey: jest.fn().mockResolvedValue({
      key: "key",
      size: 0,
      message: "message",
      status: "PROCESSING",
      lines: 0,
      userId: "userId",
      id: "id",
      filename: "filename",
      user: {
        email: "email@mail.com",
      },
    }),
    updateStatus: jest.fn(),
  },
}));

jest.mock("../../_shared/repository/user.repository", () => ({
  userRepository: {
    findBySub: jest.fn().mockResolvedValue({
      id: "userId",
      email: "email@mail.com",
      providers: {
        google: "googleId",
        cognito: "cognitoId",
      },
    }),
  },
}));

describe("generatePresignedUrl", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });
});
