import { dbHelper } from "./db-helper";

type dataRepositoryInput = any[];

type dataRepositoryOutput = Promise<void>;

export interface IDataRepository {
  save: (data: dataRepositoryInput) => dataRepositoryOutput;
}

export const dataRepository: IDataRepository = {
  async save(data: dataRepositoryInput): dataRepositoryOutput {
    const Data = dbHelper.getCollection("data");

    await Data.insertMany(data);

    return;
  },
};
