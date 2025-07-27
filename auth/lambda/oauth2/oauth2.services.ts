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
}> => {
  const { accessToken, refreshToken } = await cognito.getToken({ code });

  if (!accessToken || !refreshToken) {
    return {
      message: "Failed to retrieve tokens",
      success: false,
      data: {
        accessToken: null,
        refreshToken: null,
      },
    };
  }

  return {
    message: "Login successful",
    success: true,
    data: {
      accessToken,
      refreshToken,
    },
  };
};
