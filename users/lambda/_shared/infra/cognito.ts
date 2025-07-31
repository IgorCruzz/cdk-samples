import {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommandInput,
  AdminDeleteUserCommand,
  AdminAddUserToGroupCommand,
  AdminAddUserToGroupCommandInput,
  SignUpCommandInput,
  SignUpCommand,
  SignUpCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { ssm } from "./ssm";

const cognitoClient = new CognitoIdentityProviderClient({});

export const cognito = {
  removeUser: async (email: string): Promise<void> => {
    const userPoolId = await ssm.getUserPoolClientId();

    const params: AdminDeleteUserCommandInput = {
      UserPoolId: userPoolId,
      Username: email,
    };
    const command = new AdminDeleteUserCommand(params);
    await cognitoClient.send(command);
  },
  createUser: async (
    email: string,
    password: string
  ): Promise<SignUpCommandOutput> => {
    const clientId = await ssm.getUserPoolId();

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

    const addToGroupParams: AdminAddUserToGroupCommandInput = {
      UserPoolId: clientId,
      Username: email,
      GroupName: "user",
    };
    const addToGroupCommand = new AdminAddUserToGroupCommand(addToGroupParams);
    await cognitoClient.send(addToGroupCommand);

    return res;
  },
};
