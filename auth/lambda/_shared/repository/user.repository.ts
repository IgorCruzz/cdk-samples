import { dbHelper } from "./db-helper";

export type Users = {
  id?: string;
  name: string;
  email: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  sub?: string;
  providers: {
    cognito: string | null;
    gmail: string | null;
  };
};

export interface IUserRepository {
  findByEmail(input: { email: string }): Promise<Users | null>;
  save(data: Users): Promise<void>;
  update(data: Pick<Users, "id" | "providers">): Promise<void>;
}

export const userRepository: IUserRepository = {
  async save(data: Users): Promise<void> {
    const users = dbHelper.getCollection("users");

    const { password, ...userData } = data;

    await users.insertOne({
      ...userData,
      providers: {
        cognito: data.providers?.cognito || null,
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

  async update(data: Pick<Users, "id" | "providers">): Promise<void> {
    const users = dbHelper.getCollection("users");

    await users.updateOne(
      { id: data.id },
      {
        $set: {
          providers: data.providers,
          updatedAt: new Date(),
        },
      }
    );
  },
};
