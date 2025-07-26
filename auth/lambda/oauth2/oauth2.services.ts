import { Output } from "../shared/service/output";

type Input = {
  code: string;
};

export const service = async (data: Input): Output<any> => {
  const { code } = data;

  console.log({ code });

  return { message: "Login successful", success: true, data: {} };
};
