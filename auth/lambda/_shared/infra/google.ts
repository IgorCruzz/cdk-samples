import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();

export const google = {
  verifyToken: async ({
    credential,
    clientId,
  }: {
    credential: string;
    clientId: string;
  }) => {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    return ticket.getPayload();
  },
};
