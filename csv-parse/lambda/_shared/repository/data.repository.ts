import { ObjectId } from "mongodb";
import { dbHelper } from "./db-helper";

export type SaveManyInput = Record<string, unknown>[];
export type SaveOneInput = Record<string, unknown>;

export type GetFilesInput = {
  page: number;
  limit: number;
  archiveId: string;
};

export type FindByIdInput = { id: string };
export type DeleteInput = { id: string };
export type UpdateDataInput = {
  data: Record<string, unknown>;
  id: string;
};
export type GetKeysInput = { archiveId: string };

export type SaveOutput = void;
export type SaveOneOutput = void;
export type FindByIdOutput = unknown | null;
export type DeleteOutput = void;
export type UpdateDataOutput = void;
export type GetKeysOutput = Record<string, unknown> | null;

export type GetFilesOutput = {
  itens: unknown[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface IDataRepository {
  save: (input: SaveManyInput) => Promise<SaveOutput>;
  singleSave: (input: SaveOneInput) => Promise<SaveOneOutput>;
  get: (input: GetFilesInput) => Promise<GetFilesOutput>;
  findById: (input: FindByIdInput) => Promise<FindByIdOutput>;
  delete: (input: DeleteInput) => Promise<DeleteOutput>;
  updateData: (input: UpdateDataInput) => Promise<UpdateDataOutput>;
  getKeys: (input: GetKeysInput) => Promise<GetKeysOutput>;
  deleteMany: (input: { archiveId: string }) => Promise<void>;
}

export const dataRepository: IDataRepository = {
  async deleteMany({ archiveId }: { archiveId: string }): Promise<void> {
    const collection = dbHelper.getCollection("data");
    await collection.deleteMany({ archiveId: new ObjectId(archiveId) });
  },

  async save(input: SaveManyInput): Promise<SaveOutput> {
    const collection = dbHelper.getCollection("data");
    await collection.insertMany(input);
  },

  async singleSave(input: SaveOneInput): Promise<SaveOneOutput> {
    const collection = dbHelper.getCollection("data");
    await collection.insertOne({
      ...input,
      archiveId: new ObjectId(input.archiveId as string),
      createdAt: new Date(),
    });
  },

  async get(input: GetFilesInput): Promise<GetFilesOutput> {
    const collection = dbHelper.getCollection("data");
    const { page, limit, archiveId } = input;

    const query = { archiveId: new ObjectId(archiveId) };
    const skip = (page - 1) * limit;
    const count = await collection.countDocuments(query);

    const data = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({ archiveId: 0, createdAt: 0 })
      .toArray();

    return {
      itens: data.map(dbHelper.map),
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  },

  async findById({ id }: FindByIdInput): Promise<FindByIdOutput> {
    const collection = dbHelper.getCollection("data");
    const data = await collection.findOne({ _id: new ObjectId(id) });
    return data ? dbHelper.map(data) : null;
  },

  async delete({ id }: DeleteInput): Promise<DeleteOutput> {
    const collection = dbHelper.getCollection("data");
    await collection.deleteOne({ _id: new ObjectId(id) });
  },

  async updateData({ id, data }: UpdateDataInput): Promise<UpdateDataOutput> {
    const collection = dbHelper.getCollection("data");
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
  },

  async getKeys({ archiveId }: GetKeysInput): Promise<GetKeysOutput> {
    const collection = dbHelper.getCollection("data");

    const data = await collection.findOne(
      { archiveId: new ObjectId(archiveId) },
      { projection: { _id: 0, createdAt: 0, archiveId: 0 } }
    );

    if (!data) return null;

    const keys = Object.keys(data);
    return keys.reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {} as Record<string, unknown>);
  },
};
