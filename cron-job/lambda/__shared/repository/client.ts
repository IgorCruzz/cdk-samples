import { Client } from "pg";
import { secret } from "../infra/secret";

export const dbHelper = {
  client: null as Client | null,
  async connect(): Promise<void> {
    if (this.client) return;

    const rds = await secret.getRdsCredentials();

    this.client = new Client({
      host: rds.host,
      port: rds.port,
      user: rds.username,
      password: rds.password,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await this.client.connect();
  },

  async disconnect(): Promise<void> {
    await this.client?.end();
    this.client = null;
  },
};
