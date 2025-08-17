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
  save: (data: dataRepositoryInput, session: any) => dataRepositoryOutput;
  get: (input: GetFilesInput) => GetFilesOutput;
}

export const dataRepository: IDataRepository = {
  async save(data: dataRepositoryInput, session: any): dataRepositoryOutput {
    const Data = dbHelper.getCollection("data");

    await Data.insertMany(data, { session });

    return;
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
