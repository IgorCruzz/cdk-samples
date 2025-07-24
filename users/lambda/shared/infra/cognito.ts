import {
  CognitoIdentityProviderClient,
  SignUpCommandOutput,
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  AdminCreateUserCommandOutput,
  AdminDeleteUserCommandInput,
  AdminDeleteUserCommand,
  AdminAddUserToGroupCommand,
  AdminAddUserToGroupCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const cognitoClient = new CognitoIdentityProviderClient({});
const ssmClient = new SSMClient({});

async function getUserPoolClientId(): Promise<string> {
  const comando = new GetParameterCommand({
    Name: "/cognito/user-pool-id",
  });

  const resultado = await ssmClient.send(comando);
  return resultado.Parameter?.Value || "";
}

export const cognito = {
  removeUser: async (email: string): Promise<void> => {
    const clientId = await getUserPoolClientId();

    const params: AdminDeleteUserCommandInput = {
      UserPoolId: clientId,
      Username: email,
    };
    const command = new AdminDeleteUserCommand(params);
    await cognitoClient.send(command);
  },
  createAuthUser: async (
    email: string
  ): Promise<AdminCreateUserCommandOutput> => {
    const clientId = await getUserPoolClientId();

    const params: AdminCreateUserCommandInput = {
      UserPoolId: clientId,
      Username: email,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "email_verified", Value: "true" },
      ],
    };

    const command = new AdminCreateUserCommand(params);

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
