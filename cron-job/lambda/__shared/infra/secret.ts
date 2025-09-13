import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secretsManager = new SecretsManagerClient({});

export const secret = {
  async getRdsCredentials(): Promise<{
    username: string;
    password: string;
    host: string;
    port: number;
    dbname: string;
  }> {
    const res = await secretsManager.send(
      new GetSecretValueCommand({
        SecretId: process.env.RDS_SECRET_ARN,
      })
    );

    const secret = JSON.parse(res.SecretString ?? "{}");
    return {
      username: secret["username"],
      password: secret["password"],
      host: secret["host"],
      port: parseInt(secret["port"], 10),
      dbname: secret["dbname"],
    };
  },
  async getBrevoApiKey(): Promise<string> {
    const res = await secretsManager.send(
      new GetSecretValueCommand({
        SecretId: "prod/brevo",
      })
    );

    const secret = JSON.parse(res.SecretString ?? "{}");
    return secret["BREVO_API_KEY"];
  },
};
