import { userRepository } from "../_shared/repository/user.repository";
import { Output } from "../_shared/service/output";
import { cognito } from "../_shared/infra/cognito";

type Input = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const service = async (data: Input): Output => {
  const existingUser = await userRepository.findByEmail({ email: data.email });

  if (existingUser) {
    return { message: "Email already exists", success: false, data: null };
  }

  const authUser = await cognito.signUp(
    data.firstName,
    data.lastName,
    data.email,
    data.password
  );

  await userRepository.save({
    ...data,
    providers: {
      cognito: authUser.UserSub,
      google: null,
    },
  });

  return { message: "User created successfully", success: true, data: null };
};
