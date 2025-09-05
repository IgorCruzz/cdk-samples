import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secretsManager = new SecretsManagerClient({});

export const secret = {
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
