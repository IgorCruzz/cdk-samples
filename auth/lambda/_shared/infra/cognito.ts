import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  InitiateAuthCommandOutput,
  ConfirmSignUpCommandInput,
  ConfirmSignUpCommand,
  SignUpCommandOutput,
  SignUpCommandInput,
  SignUpCommand,
  AdminAddUserToGroupCommandInput,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { ssm } from "./ssm";

const cognitoClient = new CognitoIdentityProviderClient({});

export const cognito = {
  signUp: async (
    email: string,
    password: string
  ): Promise<SignUpCommandOutput> => {
    const clientId = await ssm.getUserPoolClientId();

    const params: SignUpCommandInput = {
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
      ],
    };

    const command = new SignUpCommand(params);

    const res = await cognitoClient.send(command);

    const userPoolId = await ssm.getUserPoolId();

    const addToGroupParams: AdminAddUserToGroupCommandInput = {
      UserPoolId: userPoolId,
      Username: email,
      GroupName: "user",
    };
    const addToGroupCommand = new AdminAddUserToGroupCommand(addToGroupParams);
    await cognitoClient.send(addToGroupCommand);

    return res;
  },
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
        idToken: null,
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

  confirmSignup: async ({
    email,
    code,
  }: {
    email: string;
    code: string;
  }): Promise<{
    error?: string | null;
    success?: boolean;
  }> => {
    try {
      const clientId = await ssm.getUserPoolClientId();

      const params: ConfirmSignUpCommandInput = {
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code,
      };

      const command = new ConfirmSignUpCommand(params);
      await cognitoClient.send(command);

      return { error: null, success: true };
    } catch (error) {
      if (error instanceof Error && error.name === "UserNotFoundException") {
        return { error: "User not found", success: false };
      }
      if (error instanceof Error && error.name === "CodeMismatchException") {
        return { error: "Invalid confirmation code", success: false };
      }
      throw error;
    }
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
      if (error instanceof Error) {
        if (error.name === "UserNotConfirmedException") {
          return { error: "User not confirmed" };
        }

        const genericLoginErrors = [
          "UserNotFoundException",
          "NotAuthorizedException",
          "PasswordResetRequiredException",
          "TooManyFailedAttemptsException",
          "TooManyRequestsException",
          "InvalidParameterException",
        ];

        if (genericLoginErrors.includes(error.name)) {
          return { error: "Invalid email or password" };
        }

        console.log("Unexpected Cognito error:", error);
      }

      throw error;
    }
  },
};
