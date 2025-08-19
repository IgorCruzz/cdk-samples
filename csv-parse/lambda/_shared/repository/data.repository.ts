import { ObjectId } from "mongodb";
import { dbHelper } from "./db-helper";

type dataRepositoryInput = any[];

type dataRepositoryOutput = Promise<void>;

type GetFilesInput = {
  page: number;
  limit: number;
  archiveId: string;
};

type GetFilesOutput = Promise<{
  itens: unknown[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}>;

export interface IDataRepository {
  save: (data: dataRepositoryInput) => dataRepositoryOutput;
  get: (input: GetFilesInput) => GetFilesOutput;
  delete: (input: { id: string }) => Promise<void>;
  findById: (input: { id: string }) => Promise<unknown>;
  singleSave: (input: Record<string, unknown>) => Promise<void>;
  updateData: (input: Record<string, unknown>, id: string) => Promise<void>;
  getKeys: (input: { archiveId: string }) => Promise<unknown>;
}

export const dataRepository: IDataRepository = {
  async getKeys(input: { archiveId: string }): Promise<unknown> {
    const collection = dbHelper.getCollection("data");

    const data = await collection.findOne({
      archiveId: new ObjectId(input.archiveId),
    });

    if (!data) {
      return null;
    }

    const keys = Object.keys(data);

    const emptyObject = keys.reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {} as Record<string, unknown>);

    return emptyObject;
  },

  async updateData(data: Record<string, unknown>, id: string): Promise<void> {
    const collection = dbHelper.getCollection("data");
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
  },

  async save(data: dataRepositoryInput): dataRepositoryOutput {
    const collection = dbHelper.getCollection("data");

    await collection.insertMany(data);

    return;
  },

  async singleSave(data: Record<string, unknown>): Promise<void> {
    const dataCollection = dbHelper.getCollection("data");

    await dataCollection.insertOne({ ...data, createdAt: new Date() });

    return;
  },

  async findById({ id }: { id: string }): Promise<unknown> {
    const dataCollection = dbHelper.getCollection("data");
    const data = await dataCollection.findOne({ _id: new ObjectId(id) });

    return data ? dbHelper.map(data) : null;
  },

  async delete({ id }: { id: string }): Promise<void> {
    const dataCollection = dbHelper.getCollection("data");
    await dataCollection.deleteOne({ _id: new ObjectId(id) });
  },

  async get(input: GetFilesInput): GetFilesOutput {
    const dataCollection = dbHelper.getCollection("data");
    const { page, limit } = input;

    const query = {
      archiveId: new ObjectId(input.archiveId),
    };

    const skip = (page - 1) * limit;
    const count = await dataCollection.countDocuments(query);

    const data = await dataCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(count / limit);

    return {
      itens: data.map(dbHelper.map),
      count,
      page,
      limit,
      totalPages,
    };
  },
};
