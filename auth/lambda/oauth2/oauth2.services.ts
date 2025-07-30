import { Output } from "../shared/service/output";
import { cognito } from "../shared/infra/cognito";

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
