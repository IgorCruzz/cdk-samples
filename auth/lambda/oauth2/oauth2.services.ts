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

  const userDecoded = jwt.decode({ token: idToken }) as {
    given_name: string;
    email: string;
    family_name: string;
  };

  const findUser = await userRepository.findByEmail({
    email: userDecoded?.email,
  });

  if (!findUser) {
    await userRepository.save({
      email: userDecoded?.email,
      provider: "Google",
      name: userDecoded?.given_name + " " + userDecoded?.family_name,
    });
  }

  // if (findUser && findUser.provider) console.log({ findUser });

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
