import { cognito } from "../_shared/infra/cognito";
import { Output } from "../_shared/service/output";

type Input = {
  refreshToken: string;
};

export const service = async (
  data: Input
): Output<{
  accessToken: string;
}> => {
  const { refreshToken } = data;

  const tokens = await cognito.refreshToken({ refreshToken });

  if (tokens.error || !tokens.accessToken) {
    return {
      message: tokens.error || "Failed to refresh token",
      success: false,
      data: null,
    };
  }

  return {
    message: "Token refreshed successfully",
    success: true,
    data: {
      accessToken: tokens.accessToken,
    },
  };
};
