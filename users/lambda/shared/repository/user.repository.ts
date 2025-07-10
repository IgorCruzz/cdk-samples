import { dbHelper } from "./db-helper";

export type Users = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type UserRepositoryInput = Users;

type GetUsersInput = {
  page: number;
  limit: number;
};

type GetUsersOutput = Promise<{
  itens: Users[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}>;

export interface IUserRepository {
  getUsers: (input: GetUsersInput) => GetUsersOutput;
  save: (item: UserRepositoryInput) => Promise<void>;
  update: (item: Users) => Promise<void>;
  delete: (id: { id: string }) => Promise<void>;
}

export const userRepository: IUserRepository = {
  async getUsers({ page, limit }) {
    const userCollection = dbHelper.getCollection("users");

    const skip = (page - 1) * limit;
    const count = await userCollection.countDocuments({});

    const users = await userCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(count / limit);

    return {
      itens: dbHelper.mapCollection(users),
      count,
      page,
      limit,
      totalPages,
    };
  },

  async save(data) {
    const users = dbHelper.getCollection("users");

    await users.insertOne({
      ...data,
      createdAt: new Date(),
    });
  },

  async update(data) {
    const users = dbHelper.getCollection("users");

    const { id, ...updateData } = data;

    await users.updateOne(
      { id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );
  },

  async delete({ id }) {
    const users = dbHelper.getCollection("users");

    await users.deleteOne({ id });
  },
};
