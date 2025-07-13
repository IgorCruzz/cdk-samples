import { dbHelper } from "./db-helper";
import {  compare } from "bcryptjs";

export type Users = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface IUserRepository { 
  validatePassword(email: string, password: string): Promise<boolean>;
}

export const userRepository: IUserRepository = {
  async validatePassword(email: string, password: string): Promise<boolean> {
    const userCollection = dbHelper.getCollection("users");
    const user = await userCollection.findOne(
      { email }
    );  

    if ((user && !await compare(password, user.password)) || !user) {
      return false;
    }

    return true;
  }, 
};
