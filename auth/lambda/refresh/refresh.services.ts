import { jwt } from '../shared/infra/jwt';
import { Output } from "../shared/service/output";

type RefreshTokenInput = {
  refreshToken: string;
};

export const refreshTokenService = async (data: RefreshTokenInput): Output<{ 
  accessToken: string; 
  refreshToken: string; 
}> => {
  const { refreshToken } = data;

  const payload = await jwt.verify(refreshToken, "refresh");

  if (!payload) {
    return { message: "Invalid refresh token", success: false, data: null };
  }

  const tokens = await jwt.sign({ email: payload.email });

  return { message: "Token refreshed successfully", success: true, data: {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  } };
};
