import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({});

export const ssm = {
  async getUserPoolClientId(): Promise<string> {
    const comando = new GetParameterCommand({
      Name: "/cognito/user-pool-client-id",
    });

    const resultado = await ssmClient.send(comando);
    return resultado.Parameter?.Value || "";
  },
};
