import { Output } from "../_shared/service/output";
import { cognito } from "../_shared/infra/cognito";

type Input = {
  email: string;
  code: string;
};

export const service = async (
  data: Input
): Output<{
  accessToken?: string;
  refreshToken?: string;
}> => {
  const { email, code } = data;

  await cognito.confirmSignup({
    email,
    code,
  });

  return {
    message: "Account confirmed successfully",
    success: true,
    data: null,
  };
};
