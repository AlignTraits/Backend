import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { getUserById } from '../models/userModel';

dotenv.config();

export const loginRequired = (
  req: Request & Record<string, any>,
  res: Response,
  next: NextFunction
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
  next: NextFunction
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

// admin middleware
export const adminLoginRequired = async (
  req: Request & Record<string, any>,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Access denied, empty token');
  const token = authHeader.split(' ')[1] ?? '';

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    req.user = { id: verified?.userId, ...req.user };

    // Fetch the user by ID
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Check if the user has an admin role
    if (user.role !== 'ADMIN') {
      return res.status(403).send('Access denied, not an admin');
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(400).send('Invalid token');
  }
};

export const superAdminLoginRequired = async (
  req: Request & Record<string, any>,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('🚨 No auth header found');
    return res.status(401).send('Access denied, empty token');
  }

  const token = authHeader.split(' ')[1] ?? '';
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    req.user = { id: verified?.userId, ...req.user };

    console.log('✅ Token verified, user ID:', req.user.id);

    // Fetch the user by ID
    const user = await getUserById(req.user.id);
    if (!user) {
      console.log('🚨 User not found');
      return res.status(404).send('User not found');
    }

    console.log('🔍 User role:', user.role);

    if (user.role !== 'SUPER_ADMIN') {
      console.log('🚨 Access denied: User is not a Super Admin');
      return res.status(403).send('Access denied, not a Super Admin');
    }

    console.log('✅ Access granted: User is a Super Admin');
    next();
  } catch (err) {
    console.log('🚨 JWT Error:', err);
    res.status(400).send('Invalid token');
  }
};
