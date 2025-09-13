import { Client } from "pg";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export const dbHelper = {
  client: null as Client | null,
  async connect(): Promise<void> {
    if (this.client) return;

    const secretArn = process.env.RDS_SECRET_ARN as string;

    const secretsClient = new SecretsManagerClient({});
    const command = new GetSecretValueCommand({ SecretId: secretArn });
    const response = await secretsClient.send(command);

    if (!response.SecretString) {
      throw new Error("Secret not found or empty");
    }

    const secret = JSON.parse(response.SecretString);

    const config = {
      host: secret.host,
      port: Number(secret.port),
      username: secret.username,
      password: secret.password,
      dbname: secret.dbname || secret.database,
    };

    this.client = new Client({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.dbname,
    });

    await this.client.connect();
  },

  async disconnect(): Promise<void> {
    await this.client?.end();
    this.client = null;
  },
};
