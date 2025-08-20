import { Output } from "../_shared/service/output";
import { cognito } from "../_shared/infra/cognito";
import { userRepository } from "../_shared/repository/user.repository";

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
  user?: {
    name: string;
  };
}> => {
  const { email, password } = data;

  const user = await userRepository.findByEmail({ email });

  if (!user) {
    return {
      message: "Invalid email or password",
      success: false,
      data: null,
    };
  }

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

  return {
    message: "Authentication successful",
    success: true,
    data: auth,
  };
};
