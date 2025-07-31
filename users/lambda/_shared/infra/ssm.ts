import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({});

export const ssm = {
  async getUserPoolClientId(): Promise<string> {
    const command = new GetParameterCommand({
      Name: "/cognito/user-pool-client-id",
    });

    const res = await ssmClient.send(command);
    return res.Parameter?.Value || "";
  },
  async getUserPoolId(): Promise<string> {
    const command = new GetParameterCommand({
      Name: "/cognito/user-pool-id",
    });

    const res = await ssmClient.send(command);
    return res.Parameter?.Value || "";
  },
};
