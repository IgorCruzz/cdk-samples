import { userRepository } from "../_shared/repository/user.repository";
import { Output } from "../_shared/service/output";
import { cognito } from "../_shared/infra/cognito";

type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

export const service = async (data: SignUpInput): Output => {
  const existingUser = await userRepository.findByEmail({ email: data.email });

  if (existingUser) {
    return { message: "Email already exists", success: false, data: null };
  }

  const authUser = await cognito.signUp(data.email, data.password);

  await userRepository.save({
    ...data,
    providers: {
      cognito: authUser.UserSub,
      google: null,
    },
  });

  return { message: "User created successfully", success: true, data: null };
};
