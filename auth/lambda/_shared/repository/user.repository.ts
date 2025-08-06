import { dbHelper } from "./db-helper";

export type Users = {
  id?: string;
  name: string;
  email: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  sub?: string;
  provider?: "Cognito" | "Google";
};

export interface IUserRepository {
  findByEmail(input: { email: string }): Promise<Users | null>;
  save(data: Users): Promise<void>;
}

export const userRepository: IUserRepository = {
  async save(data: Users): Promise<void> {
    const users = dbHelper.getCollection("users");

    const { password, ...userData } = data;

    await users.insertOne({
      ...userData,
      providers: {
        cognito: data.sub,
        gmail: null,
      },
      createdAt: new Date(),
    });
  },

  async findByEmail({ email }: { email: string }): Promise<Users> {
    const users = dbHelper.getCollection("users");
    const user = await users.findOne({ email });

    return user && dbHelper.map(user);
  },
};
