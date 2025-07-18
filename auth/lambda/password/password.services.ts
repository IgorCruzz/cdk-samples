import { Output } from "../shared/service/output";
import { cognito } from "../shared/infra/cognito";

type Input = {
  email: string;
  password: string;
  session?: string;
};

export const service = async (
  data: Input
): Output<{
  accessToken?: string;
  refreshToken?: string;
}> => {
  const { email, password, session } = data;

  const auth = await cognito.authChallenge({
    email,
    password,
    session,
  });

  if (auth.error) {
    return { message: auth.error, success: false, data: null };
  }

  return {
    message: "Password changed successfully",
    success: true,
    data: null,
  };
};
