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
  singleSave: (input: unknown) => Promise<void>;
}

export const dataRepository: IDataRepository = {
  async save(data: dataRepositoryInput): dataRepositoryOutput {
    const Data = dbHelper.getCollection("data");

    await Data.insertMany(data);

    return;
  },

  async singleSave(data: unknown): Promise<void> {
    const dataCollection = dbHelper.getCollection("data");
    return;
  },

  async findById({ id }: { id: string }): Promise<unknown> {
    const dataCollection = dbHelper.getCollection("data");
    const data = await dataCollection.findOne({ _id: new ObjectId(id) });

    return dbHelper.map(data);
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
