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
  findBySub(id: string): Promise<Users | null>;
}

export const userRepository: IUserRepository = {
  async findBySub(id: string): Promise<Users | null> {
    const users = dbHelper.getCollection("users");

    const user = await users.findOne({
      $or: [{ "providers.google": id }, { "providers.cognito": id }],
    });

    return user && dbHelper.map(user);
  },
};
