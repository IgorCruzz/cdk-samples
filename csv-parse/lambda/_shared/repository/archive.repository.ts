import { ObjectId } from "mongodb";
import { dbHelper } from "./db-helper";
import { queryBuilder } from "./query-builder";

export type Files = {
  endpoint: string;
  key: string;
  size: number;
  message: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED" | "PENDING";
  lines?: number;
  userId: string;
  id?: string;
  filename?: string;
  user?: {
    email: string;
  };
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
    data: Pick<ArchiveRepositoryInput, "key" | "status" | "message" | "lines">
  ): Promise<void>;
  getStatistics(): GetStatisticOutput;
  getFileByKey: (input: { key: string }) => Promise<Files | null>;
  getByEndpoint: (input: {
    endpoint: string;
    userId: string;
  }) => Promise<Files | null>;
}

export const archiveRepository: IArchiveRepository = {
  async getByEndpoint({
    endpoint,
    userId,
  }: {
    endpoint: string;
    userId: string;
  }): Promise<Files | null> {
    const archiveCollection = dbHelper.getCollection("archives");

    const file = await archiveCollection.findOne({
      endpoint,
      userId: new ObjectId(userId),
    });

    return file ? dbHelper.map(file) : null;
  },

  async getFileByKey({ key }: { key: string }): Promise<Files | null> {
    const archiveCollection = dbHelper.getCollection("archives");

    const query = queryBuilder()
      .lookup({
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      })
      .match({
        key,
      })
      .unwind({
        path: "$user",
        preserveNullAndEmptyArrays: true,
      })
      .build();

    const file = await archiveCollection.aggregate(query).next();

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

    const query = queryBuilder()
      .lookup({
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      })
      .match({
        $or: [
          { "user.providers.google": sub },
          { "user.providers.cognito": sub },
        ],
      })
      .unwind({
        path: "$user",
        preserveNullAndEmptyArrays: true,
      })
      .facet({
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $addFields: {
              createdAt: {
                $dateToString: {
                  format: "%d/%m/%Y %H:%M:%S",
                  date: "$createdAt",
                  timezone: "America/Sao_Paulo",
                },
              },
            },
          },
        ],
        total: [{ $count: "count" }],
      })
      .build();

    const [result] = await archiveCollection.aggregate(query).toArray();

    const itens = dbHelper.mapCollection(result.data || []);
    const total = result.total?.[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      itens,
      count: total,
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
      lines: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },

  async updateStatus({ key, status, message, lines = 0 }): Promise<void> {
    const archives = dbHelper.getCollection("archives");

    await archives.updateOne(
      { key },
      {
        $set: {
          status,
          message,
          lines,
          updatedAt: new Date(),
        },
      }
    );
  },
};
