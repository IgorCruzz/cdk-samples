import { ObjectId } from "mongodb";
import { dbHelper } from "./db-helper";
import { queryBuilder } from "./query-builder";

export type Files = {
  endpoint: string;
  key: string;
  size: number;
  message: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED" | "PENDING";
  userId: string;
  id?: string;
  filename?: string;
  user?: {
    email: string;
  };
};

export type SaveArchiveInput = Files;

export type GetFilesInput = {
  page: number;
  limit: number;
  sub?: string;
};

export type UpdateStatusInput = Pick<Files, "key" | "status" | "message">;
export type GetFileByKeyInput = { key: string };
export type GetByEndpointInput = { endpoint: string; userId: string };

export type SaveArchiveOutput = void;

export type GetFilesOutput = {
  itens: Files[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetStatisticOutput = {
  totalSuccess: number;
  totalFailed: number;
};

export type GetFileByKeyOutput = Files | null;
export type GetByEndpointOutput = Files | null;

export interface IArchiveRepository {
  getFiles(input: GetFilesInput): Promise<GetFilesOutput>;
  save(input: SaveArchiveInput): Promise<SaveArchiveOutput>;
  updateStatus(input: UpdateStatusInput): Promise<void>;
  getStatistics(): Promise<GetStatisticOutput>;
  getFileByKey(input: GetFileByKeyInput): Promise<GetFileByKeyOutput>;
  getByEndpoint(input: GetByEndpointInput): Promise<GetByEndpointOutput>;
  getFileById(input: { id: string }): Promise<Files | null>;
}

export const archiveRepository: IArchiveRepository = {
  async getFileById(input: { id: string }): Promise<Files | null> {
    const archiveCollection = dbHelper.getCollection("archives");
    const file = await archiveCollection.findOne({
      _id: new ObjectId(input.id),
    });
    return file ? dbHelper.map(file) : null;
  },

  async getByEndpoint(input: GetByEndpointInput): Promise<GetByEndpointOutput> {
    const archiveCollection = dbHelper.getCollection("archives");

    const file = await archiveCollection.findOne({
      endpoint: input.endpoint,
      userId: new ObjectId(input.userId),
    });

    return file ? dbHelper.map(file) : null;
  },

  async getFileByKey(input: GetFileByKeyInput): Promise<GetFileByKeyOutput> {
    const archiveCollection = dbHelper.getCollection("archives");

    const query = queryBuilder()
      .lookup({
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      })
      .match({ key: input.key })
      .unwind({
        path: "$user",
        preserveNullAndEmptyArrays: true,
      })
      .build();

    const file = await archiveCollection.aggregate(query).next();

    return file ? dbHelper.map(file) : null;
  },

  async getStatistics(): Promise<GetStatisticOutput> {
    const archiveCollection = dbHelper.getCollection("archives");

    const totalSuccess = await archiveCollection.countDocuments({
      status: "COMPLETED",
    });

    const totalFailed = await archiveCollection.countDocuments({
      status: "FAILED",
    });

    return { totalSuccess, totalFailed };
  },

  async getFiles(input: GetFilesInput): Promise<GetFilesOutput> {
    const archiveCollection = dbHelper.getCollection("archives");
    const skip = (input.page - 1) * input.limit;

    const query = queryBuilder()
      .lookup({
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      })
      .match({
        $or: [
          { "user.providers.google": input.sub },
          { "user.providers.cognito": input.sub },
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
          { $limit: input.limit },
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

    return {
      itens,
      count: total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit),
    };
  },

  async save(input: SaveArchiveInput): Promise<SaveArchiveOutput> {
    const archives = dbHelper.getCollection("archives");

    await archives.insertOne({
      ...input,
      userId: new ObjectId(input.userId),
      lines: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },

  async updateStatus(input: UpdateStatusInput): Promise<void> {
    const archives = dbHelper.getCollection("archives");

    await archives.updateOne(
      { key: input.key },
      {
        $set: {
          status: input.status,
          message: input.message,
          updatedAt: new Date(),
        },
      }
    );
  },
};
