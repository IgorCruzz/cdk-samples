import { Output } from "../_shared/service/output";
import { cognito } from "../_shared/infra/cognito";
import { userRepository } from "../_shared/repository/user.repository";
import { jwt } from "../_shared/infra/jwt";

type Input = {
  code: string;
};

export const service = async ({
  code,
}: Input): Output<{
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
}> => {
  const { accessToken, refreshToken, idToken } = await cognito.getToken({
    code,
  });

  if (!accessToken || !refreshToken || !idToken) {
    return {
      message: "Failed to retrieve tokens",
      success: false,
      data: {
        accessToken: null,
        refreshToken: null,
        idToken: null,
      },
    };
  }

  const decoded = jwt.decode(idToken) as { email: string };

  const findUser = await userRepository.findByEmail({
    email: decoded?.email,
  });

  if (!findUser) {
    // await userRepository.save({
    //   ...data,
    //   sub: authUser.UserSub,
    //   provider: "cognito",
    // });
  }

  // if (findUser && findUser.provider) console.log({ findUser });

  // await userRepository.save({
  //   ...data,
  //   sub: authUser.UserSub,
  //   provider: "cognito",
  // });

  return {
    message: "Login successful",
    success: true,
    data: {
      accessToken,
      refreshToken,
      idToken,
    },
  };
};
