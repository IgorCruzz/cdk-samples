import { ObjectId } from "mongodb";
import { dbHelper } from "./db-helper";
import { hash } from "bcryptjs";

export type Users = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface IUserRepository {
  getUsers(input: { page: number; limit: number }): Promise<{
    itens: Users[];
    count: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  save(item: Users): Promise<void>;
  update(item: Users): Promise<void>;
  delete(input: { id: string }): Promise<void>;
  findByEmail(email: string): Promise<Users | null>;
  findById(id: string): Promise<Users | null>;
}

export const userRepository: IUserRepository = {
  async getUsers({ page, limit }: { page: number; limit: number }) {
    const userCollection = dbHelper.getCollection("users");
    const skip = (page - 1) * limit;
    const count = await userCollection.countDocuments();

    const users = await userCollection
      .find({}, { projection: { password: 0 } })
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

  async save(data: Users): Promise<void> {
    if (data.password) {
      data.password = await hash(data.password, 10);
    }

    const users = dbHelper.getCollection("users");
    await users.insertOne({
      ...data,
      createdAt: new Date(),
    });
  },

  async update(data: Users): Promise<void> {
    const users = dbHelper.getCollection("users");
    const { id, ...updateData } = data;

    await users.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );
  },

  async delete({ id }: { id: string }): Promise<void> {
    const users = dbHelper.getCollection("users");
    await users.deleteOne({ _id: new ObjectId(id) });
  },

  async findById(id: string): Promise<Users | null> {
    const users = dbHelper.getCollection("users");

    const user = await users.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    return user && dbHelper.map(user);
  },

  async findByEmail(email: string): Promise<Users> {
    const users = dbHelper.getCollection("users");
    const user = await users.findOne(
      { email },
      { projection: { password: 0 } }
    );

    return user && dbHelper.map(user);
  },
};
