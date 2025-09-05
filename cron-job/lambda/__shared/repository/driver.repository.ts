import { client } from "./client";

type getExpiredDriversOutput = {
  id: string;
  name: string;
  email: string;
}[];

export interface IDriverRepository {
  getExpiredDrivers(): Promise<getExpiredDriversOutput>;
}

export const driverRepository: IDriverRepository = {
  getExpiredDrivers: async (): Promise<getExpiredDriversOutput> => {
    const result = await client.query(
      "SELECT id, name, email FROM drivers WHERE DATE(license_expiration) = CURRENT_DATE;",
      []
    );
    return result.rows;
  },
};
