import { ObjectId } from "mongodb";
import { actualDate } from "../utils/locale-date.util";
import { dbHelper } from "./db-helper";

export type Files = {
  key: string;
  size: number;
  message: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED" | "PENDING";
  successLines?: number;
  failedLines?: number;
  userId: string;
  id?: string;
  filename?: string;
};

type ArchiveRepositoryInput = Files;

type ArchiveRepositoryOutput = void;

type GetFilesInput = {
  page: number;
  limit: number;
};

type GetFilesOutput = Promise<{
  itens: Files[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}>;

type GetStatisticOutput = Promise<{
  totalSuccess: number;
  totalFailed: number;
}>;

export interface IArchiveRepository {
  getFiles: (input: GetFilesInput) => GetFilesOutput;
  save: (input: ArchiveRepositoryInput) => Promise<ArchiveRepositoryOutput>;
  updateStatus(
    data: Pick<
      ArchiveRepositoryInput,
      "key" | "status" | "message" | "successLines" | "failedLines"
    >
  ): Promise<void>;
  getStatistics(): GetStatisticOutput;
  getFileByKey: (key: string) => Promise<Files | null>;
}

export const archiveRepository: IArchiveRepository = {
  async getFileByKey(key: string): Promise<Files | null> {
    const archiveCollection = dbHelper.getCollection("archives");
    const file = await archiveCollection.findOne({ key });

    return file ? dbHelper.map(file) : null;
  },

  async getStatistics(): GetStatisticOutput {
    const archiveCollection = dbHelper.getCollection("archives");

    const totalSuccess = await archiveCollection.countDocuments({
      status: "COMPLETED",
    });

    const totalFailed = await archiveCollection.countDocuments({
      status: "FAILED",
    });

    return {
      totalSuccess,
      totalFailed,
    };
  },

  async getFiles({ page, limit }: GetFilesInput): GetFilesOutput {
    const archiveCollection = dbHelper.getCollection("archives");

    const skip = (page - 1) * limit;
    const count = await archiveCollection.countDocuments({});

    const archives = await archiveCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(count / limit);

    return {
      itens: dbHelper.mapCollection(archives),
      count,
      page,
      limit,
      totalPages,
    };
  },

  async save(item: ArchiveRepositoryInput): Promise<ArchiveRepositoryOutput> {
    const archives = dbHelper.getCollection("archives");

    await archives.insertOne({
      ...item,
      userId: new ObjectId(item.userId),
      successLines: 0,
      failedLines: 0,
      createdAt: actualDate,
    });
  },

  async updateStatus({
    key,
    status,
    message,
    successLines = 0,
    failedLines = 0,
  }): Promise<void> {
    const archives = dbHelper.getCollection("archives");

    await archives.updateOne(
      { key },
      {
        $set: {
          status,
          message,
          successLines,
          failedLines,
          updatedAt: actualDate,
        },
      }
    );
  },
};
