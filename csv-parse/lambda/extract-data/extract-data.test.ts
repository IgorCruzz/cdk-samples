import { service } from "../extract-data/extract-data.service";
import { archiveRepository } from "../_shared/repository/archive.repository";
import { dataRepository } from "../_shared/repository/data.repository";
import { sendNotification } from "../_shared/infra/send-notification";
import { normalizeRow } from "../_shared/utils/normalize.util";
import { s3 } from "../_shared/infra/s3";

jest.mock("../_shared/infra/s3", () => ({
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

jest.mock("../_shared/repository/archive.repository", () => ({
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

jest.mock("../_shared/repository/data.repository", () => ({
  dataRepository: {
    save: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue({
      itens: [{ id: "mocked-id", name: "mocked-name" }],
      count: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    }),
  },
}));

jest.mock("../../_shared/infra/send-notification", () => ({
  sendNotification: {
    send: jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    }),
  },
}));

jest.mock("../../_shared/utils/normalize.util", () => ({
  formatKey: jest.fn((str: string) => `mocked-${str}`),
  normalizeRow: jest.fn(() => ({ mocked: true })),
}));

const mockS3Record = {
  eventVersion: "2.1",
  eventSource: "aws:s3",
  awsRegion: "us-east-1",
  eventTime: "2025-08-07T12:34:56.000Z",
  eventName: "ObjectCreated:Put",
  userIdentity: {
    principalId: "AWS:EXAMPLE",
  },
  requestParameters: {
    sourceIPAddress: "127.0.0.1",
  },
  responseElements: {
    "x-amz-request-id": "EXAMPLE123456789",
    "x-amz-id-2": "EXAMPLE123/abcdeEXAMPLE=",
  },
  s3: {
    s3SchemaVersion: "1.0",
    configurationId: "testConfigRule",
    bucket: {
      name: "my-bucket-name",
      ownerIdentity: {
        principalId: "EXAMPLE",
      },
      arn: "arn:aws:s3:::my-bucket-name",
    },
    object: {
      key: "uploads/example-file.xlsx",
      size: 12345,
      eTag: "abc123etag",
      sequencer: "00123456789ABCDEF",
    },
  },
};

describe("Extract Data Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be able to call getFileByKey", async () => {
    await service({
      s3Record: mockS3Record,
    });

    expect(archiveRepository.getFileByKey).toHaveBeenCalledWith({
      key: mockS3Record.s3.object.key,
    });
  });

  it("should log an error if file does not exists", async () => {
    (archiveRepository.getFileByKey as jest.Mock).mockResolvedValueOnce(null);

    const log = jest.spyOn(console, "log");

    await service({
      s3Record: mockS3Record,
    });

    expect(log).toHaveBeenCalledWith(
      `File not found for key: ${mockS3Record.s3.object.key}. Skipping processing.`
    );
  });

  it("should be able to call getObject", async () => {
    await service({
      s3Record: mockS3Record,
    });

    expect(s3.getObject).toHaveBeenCalledWith({
      key: mockS3Record.s3.object.key,
      Bucket: mockS3Record.s3.bucket.name,
    });
  });

  it("should be able to call updateStatus", async () => {
    await service({
      s3Record: mockS3Record,
    });

    expect(archiveRepository.updateStatus).toHaveBeenCalledWith({
      key: mockS3Record.s3.object.key,
      message: ``,
      status: "PROCESSING",
    });
  });
});
