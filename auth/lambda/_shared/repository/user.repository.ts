import { ObjectId } from "mongodb";
import { dbHelper } from "./db-helper";

export type Users = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  sub?: string;
};

export interface IUserRepository {
  findByEmail(email: string): Promise<Users | null>;
  save(data: Users): Promise<void>;
}

export const userRepository: IUserRepository = {
  async save(data: Users): Promise<void> {
    const users = dbHelper.getCollection("users");

    const { password, ...userData } = data;

    await users.insertOne({
      ...userData,
      createdAt: new Date(),
    });
  },

  async findByEmail(email: string): Promise<Users> {
    const users = dbHelper.getCollection("users");
    const user = await users.findOne({ email });

    return user && dbHelper.map(user);
  },
};
