import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  SignUpCommandInput,
  SignUpCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const cognitoClient = new CognitoIdentityProviderClient({});
const ssmClient = new SSMClient({});

async function getUserPoolClientId(): Promise<string> {
  const comando = new GetParameterCommand({
    Name: "/cognito/user-pool-client-id",
  });

  const resultado = await ssmClient.send(comando);
  return resultado.Parameter?.Value || "";
}

export const cognito = {
  createAuthUser: async (
    email: string,
    password: string
  ): Promise<SignUpCommandOutput> => {
    const clientId = await getUserPoolClientId();

    const params: SignUpCommandInput = {
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    };

    const command = new SignUpCommand(params);
    return (await cognitoClient.send(command)) as SignUpCommandOutput;
  },
};
