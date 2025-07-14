import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { sign } from 'jsonwebtoken' 

async function getJWTSecret(): Promise<string> {
  const res = await secretsManager.send(
    new GetSecretValueCommand({
      SecretId: "jwt/secret",
    })
  );

  const secret = JSON.parse(res.SecretString ?? "{}");
  return secret["JWT_SECRET"];
}

const secretsManager = new SecretsManagerClient();

export const jwt = {
  sign: async (payload: object): Promise<{
    accessToken: string;
    refreshToken: string;
  }> => {

    const accessToken = sign(payload, await getJWTSecret(), {
      expiresIn: '1h',
    });

    const refreshToken = sign(payload, await getJWTSecret(), {
      expiresIn: '1d',
    });

    return  { accessToken, refreshToken  };
  },
}