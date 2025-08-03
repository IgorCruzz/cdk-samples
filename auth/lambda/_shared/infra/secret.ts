import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secretsManager = new SecretsManagerClient({});

export const secret = {
  async getMongoUri(): Promise<string> {
    const res = await secretsManager.send(
      new GetSecretValueCommand({
        SecretId: "mongodb/uri",
      })
    );

    const secret = JSON.parse(res.SecretString ?? "{}");
    return secret["MONGO_URI"];
  },
};
