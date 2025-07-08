import { actualDate } from "../utils/locale-date.util";
import { dbHelper } from "./db-helper";

export type Files = {
  key: string;
  size: number;
  message: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  successLines?: number;
  failedLines?: number;
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

export interface IArchiveRepository {
  getFiles: (input: GetFilesInput) => GetFilesOutput;
  save: (input: ArchiveRepositoryInput) => Promise<ArchiveRepositoryOutput>;
  updateStatus(
    data: Pick<
      ArchiveRepositoryInput,
      "key" | "status" | "message" | "successLines" | "failedLines"
    >
  ): Promise<void>;
}

export class ArchiveRepository implements IArchiveRepository {
  async getFiles({ page, limit }: GetFilesInput): GetFilesOutput {
    const archiveCollection = dbHelper.getCollection("customers");

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
  }

  async save(item: ArchiveRepositoryInput): Promise<ArchiveRepositoryOutput> {
    const archives = dbHelper.getCollection("archive");

    await archives?.insertOne({
      ...item,
      successLines: 0,
      failedLines: 0,
      createdAt: actualDate,
    });
  }

  async updateStatus({
    key,
    status,
    message,
    successLines = 0,
    failedLines = 0,
  }: Pick<
    ArchiveRepositoryInput,
    "key" | "status" | "message" | "successLines" | "failedLines"
  >): Promise<void> {
    const archives = dbHelper.getCollection("archive");

    await archives?.updateOne(
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
  }
}
