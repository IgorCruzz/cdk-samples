import {
  CognitoIdentityProviderClient,
  SignUpCommandOutput,
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
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
  createAuthUser: async (email: string): Promise<SignUpCommandOutput> => {
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
    return (await cognitoClient.send(command)) as SignUpCommandOutput;
  },
};
