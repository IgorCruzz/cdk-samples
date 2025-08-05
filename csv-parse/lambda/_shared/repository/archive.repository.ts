import { ObjectId } from "mongodb";
import { dbHelper } from "./db-helper";
import { queryBuilder } from "./query-builder";

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
  sub?: string;
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

  async getFiles({ page, limit, sub }: GetFilesInput): GetFilesOutput {
    const archiveCollection = dbHelper.getCollection("archives");

    const skip = (page - 1) * limit;
    const count = await archiveCollection.countDocuments({
      sub,
    });

    const query = queryBuilder()
      .lookup({
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      })
      .match({
        "user.sub": sub,
      })
      .unwind({
        path: "$user",
        preserveNullAndEmptyArrays: true,
      })
      .limit(limit)
      .skip(skip)
      .sort({
        createdAt: -1,
      })
      .build();

    const archives = await archiveCollection.aggregate(query).toArray();

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
      createdAt: new Date(),
      updatedAt: new Date(),
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
          updatedAt: new Date(),
        },
      }
    );
  },
};
