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
  }> {
    // const res = await secretsManager.send(
    //   new GetSecretValueCommand({
    //     SecretId: process.env.RDS_SECRET_ARN,
    //   })
    // );

    // const secret = JSON.parse(res.SecretString ?? "{}");
    return {
      username: "postgres", //secret["username"],
      password: "w8u-ypPB9FiYW6x2bbagH8Xa1sXFt^",
      host: "stack-rds-constructrdsinstancerdsa1a86a3e-41uajpcq8mhh.c9tnmo9usbin.us-east-1.rds.amazonaws.com",
      port: 5432,
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
