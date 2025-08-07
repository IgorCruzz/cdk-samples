import { service } from "../../generate-presigned-url/generate-presigned-url.service";
import { archiveRepository } from "../../_shared/repository/archive.repository";
import { userRepository } from "../../_shared/repository/user.repository";
import { s3 } from "../../_shared/infra/s3";

jest.mock("../../_shared/infra/s3", () => ({
  s3: {
    createPresignedUrl: jest.fn().mockResolvedValue({
      url: "https://fake-s3-url.com/upload.csv",
      key: "mocked-key.csv",
    }),
    getObject: jest.fn().mockResolvedValue({
      pipe: jest.fn(),
    }),
    removeObject: jest.fn().mockResolvedValue(undefined),
  },
}));

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
    save: jest.fn(),
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

  it("should be able to call createPresignedUrl", async () => {
    await service({
      userId: "userId",
      size: 123465,
      filename: "filename",
    });

    expect(s3.createPresignedUrl).toHaveBeenCalled();
  });

  it("should be able to call findBySub", async () => {
    await service({
      userId: "userId",
      size: 123465,
      filename: "filename",
    });

    expect(userRepository.findBySub).toHaveBeenCalledWith("userId");
  });
});
