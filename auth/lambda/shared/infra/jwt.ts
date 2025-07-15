import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { sign, verify } from 'jsonwebtoken' 

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
      expiresIn: '5m',
    });

    const refreshToken = sign(payload, await getJWTSecret(), {
      expiresIn: '1d',
    });

    return  { accessToken, refreshToken  };
  },

  verify: async (token: string, type: 'access' | 'refresh'): Promise<any> => {
    try {
      return verify(token, await getJWTSecret());
    } catch (error) {
      console.error(`JWT verification failed for ${type} token:`, error);
      return null;
    }
  }
}