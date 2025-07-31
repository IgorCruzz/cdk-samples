import { Output } from "../_shared/service/output";
import { cognito } from "../_shared/infra/cognito";

type Input = {
  email: string;
  password: string;
};

export const service = async (
  data: Input
): Output<{
  accessToken?: string;
  refreshToken?: string;
  session?: string;
}> => {
  const { email, password } = data;

  const auth = await cognito.auth({
    email,
    password,
  });

  if (auth.error) {
    return {
      message: auth.error,
      success: false,
      data: auth.session ? { session: auth?.session } : null,
    };
  }

  return { message: "Login successful", success: true, data: auth };
};
