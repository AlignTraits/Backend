import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';

dotenv.config();

export const loginRequired = (
  req: Request & Record<string, any>,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Access denied, empty token');
  const token = authHeader.split(' ')[1] ?? '';

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    req.user = { id: verified?.userId, ...req.user };
    next();
  } catch (err) {
    console.log(err);
    res.status(400).send('Invalid token');
  }
};

export const preventLoggedUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization;
  if (!token) return next();

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    return res.status(401).send('Access denied. Empty token');
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};
