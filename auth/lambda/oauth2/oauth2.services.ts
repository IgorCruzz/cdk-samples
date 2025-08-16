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
    sub: string;
  };

  console.log({ userDecoded });

  const findUser = await userRepository.findByEmail({
    email: userDecoded?.email,
  });

  if (!findUser) {
    await userRepository.save({
      email: userDecoded?.email,
      providers: {
        cognito: null,
        google: userDecoded.sub,
      },
      firstName: userDecoded?.given_name,
      lastName: userDecoded?.family_name,
    });
  }

  if (
    findUser &&
    findUser.providers &&
    findUser.providers.cognito &&
    !findUser.providers.google
  ) {
    await userRepository.update({
      id: findUser.id,
      providers: {
        cognito: findUser.providers.cognito,
        google: userDecoded.sub,
      },
    });
  }

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
