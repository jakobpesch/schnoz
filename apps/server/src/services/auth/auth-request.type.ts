import { Request } from 'express';

export type AuthRequest = Request & {
  user: {
    email: string | null;
    name: string;
    sub: string;
    iat: number;
    exp: number;
  };
};
