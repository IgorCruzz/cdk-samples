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
  startKey?: string;
  limit: number;
};

type GetFilesOutput = Promise<{
  itens: Files[];
  lastKey: string | null;
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
  async getFiles({ startKey, limit }: GetFilesInput): GetFilesOutput {
    const archiveCollection = dbHelper.getCollection("archive");

    const archives = await archiveCollection?.aggregate().toArray();

    return {
      itens: archives as Files[],
      lastKey: null,
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
