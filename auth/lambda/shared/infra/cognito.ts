import {
  AuthFlowType,
  CognitoIdentityProviderClient, 
  CognitoIdentityProviderServiceException, 
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  InitiateAuthCommandOutput
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
  auth: async ({ email, password }: { email: string; password: string }): Promise<
  {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    session?: string;
  }> => {
    try {
      const clientId = await getUserPoolClientId();

      const params: InitiateAuthCommandInput = {
       ClientId: clientId,
       AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
       AuthParameters: {
          USERNAME: email,
          PASSWORD: password,  
       }
    };

    const command = new InitiateAuthCommand(params);

    const res: InitiateAuthCommandOutput = await cognitoClient.send(command);

    if (res.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      return { error: "New password required", session: res.Session };
    }

    const authResult = res.AuthenticationResult; 

    if (!authResult ) return { error:"Invalid credentials" }; 

    return { accessToken: authResult.AccessToken!, refreshToken: authResult.RefreshToken! };
    } catch (error) {      
      return { error:"Invalid credentials" };
    }    
  },
};
