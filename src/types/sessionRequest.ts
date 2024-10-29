import { Request } from 'express';

export interface SessionRequest extends Request {
  user?: {
    id: string;
  };
}
