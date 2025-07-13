import { sign } from 'jsonwebtoken' 

export const jwt = {
  sign: (payload: object): {
    accessToken: string;
    refreshToken: string;
  } => {
    
    const accessToken = sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    const refreshToken = sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    return  { accessToken, refreshToken  };
  },
}