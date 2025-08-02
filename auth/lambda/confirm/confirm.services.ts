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

  const confirmSignUp = await cognito.confirmSignup({
    email,
    code,
  });

  if (confirmSignUp.error) {
    return {
      message: confirmSignUp.error,
      success: false,
      data: null,
    };
  }

  return {
    message: "Account confirmed successfully",
    success: true,
    data: null,
  };
};
