import { User } from 'database';
import { Request } from 'express';

export type AuthRequest = Request & {
  user: {
    email: string | null;
    name: string;
    friendCode: User['friendCode'];
    sub: string;
    iat: number;
    exp: number;
  };
};
