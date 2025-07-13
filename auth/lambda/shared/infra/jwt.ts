import { sign } from 'jsonwebtoken' 

export const jwt = {
  sign: (payload: object): string => {
    return sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
  },
}