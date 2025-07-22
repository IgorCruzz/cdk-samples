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
}

export const dataRepository: IDataRepository = {
  async save(data: dataRepositoryInput): dataRepositoryOutput {
    const Data = dbHelper.getCollection("data");

    await Data.insertMany(data);

    return;
  },

  async get(input: GetFilesInput): GetFilesOutput {
    const dataCollection = dbHelper.getCollection("data");
    const { page, limit } = input;

    const skip = (page - 1) * limit;
    const count = await dataCollection.countDocuments({});

    const data = await dataCollection
      .find({
        archiveId: new ObjectId(input.archiveId),
      })
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
