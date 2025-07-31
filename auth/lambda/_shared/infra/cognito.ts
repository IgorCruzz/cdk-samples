import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  InitiateAuthCommandOutput,
  RespondToAuthChallengeCommand,
  RespondToAuthChallengeCommandInput,
  RespondToAuthChallengeCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { ssm } from "./ssm";

const cognitoClient = new CognitoIdentityProviderClient({});

export const cognito = {
  getToken: async ({ code }: { code: string }) => {
    const clientId = await ssm.getUserPoolClientId();

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: "https://api.igorcruz.space/v1/auth/oauth2",
      code,
    });

    const response = await fetch(
      "https://sheetparse.auth.us-east-1.amazoncognito.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      return {
        accessToken: null,
        refreshToken: null,
      };
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
    };
  },

  refreshToken: async ({
    refreshToken,
  }: {
    refreshToken: string;
  }): Promise<{
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }> => {
    const clientId = await ssm.getUserPoolClientId();

    const params = {
      ClientId: clientId,
      AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    };

    const command = new InitiateAuthCommand(params);
    const res: InitiateAuthCommandOutput = await cognitoClient.send(command);

    if (!res.AuthenticationResult || !res.AuthenticationResult.AccessToken) {
      return { error: "Invalid refresh token" };
    }

    return {
      accessToken: res.AuthenticationResult.AccessToken,
    };
  },

  authChallenge: async ({
    email,
    password,
    session,
  }: {
    email: string;
    password: string;
    session?: string;
  }) => {
    const clientId = await ssm.getUserPoolClientId();

    const params: RespondToAuthChallengeCommandInput = {
      ClientId: clientId,
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      Session: session,
      ChallengeResponses: {
        USERNAME: email,
        NEW_PASSWORD: password,
      },
    };

    const command = new RespondToAuthChallengeCommand(params);
    const res: RespondToAuthChallengeCommandOutput = await cognitoClient.send(
      command
    );

    if (
      !res.AuthenticationResult ||
      !res.AuthenticationResult.AccessToken ||
      !res.AuthenticationResult.RefreshToken
    ) {
      return { error: "Invalid credentials" };
    }

    return {
      accessToken: res.AuthenticationResult.AccessToken,
      refreshToken: res.AuthenticationResult.RefreshToken,
    };
  },

  auth: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    session?: string;
    idToken?: string;
  }> => {
    try {
      const clientId = await ssm.getUserPoolClientId();

      const params: InitiateAuthCommandInput = {
        ClientId: clientId,
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      };

      const command = new InitiateAuthCommand(params);

      const res: InitiateAuthCommandOutput = await cognitoClient.send(command);

      if (
        !res.AuthenticationResult ||
        !res.AuthenticationResult.AccessToken ||
        !res.AuthenticationResult.RefreshToken
      ) {
        return { error: "Invalid credentials" };
      }

      return {
        accessToken: res.AuthenticationResult.AccessToken,
        refreshToken: res.AuthenticationResult.RefreshToken,
        idToken: res.AuthenticationResult.IdToken,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "UserNotConfirmedException"
      ) {
        return { error: "User not confirmed" };
      }

      throw error;
    }
  },
};
