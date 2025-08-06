import { decode } from "jsonwebtoken";

export const jwt = {
  decode: (token: string) => {
    try {
      return decode(token);
    } catch (error) {
      console.error("JWT decode error:", error);
      return null;
    }
  },
};
