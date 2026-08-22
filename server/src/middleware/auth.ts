import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { db } from '../models/db.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    employeeId: string;
    email: string;
    role: 'Employee' | 'Admin' | 'HR';
    name: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication token is missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    // Verify user exists in database
    const user = db.getEmployeeById(decoded.id) || db.getEmployeeByEmail(decoded.email);
    if (!user) {
      res.status(401).json({ success: false, message: 'User account no longer exists' });
      return;
    }

    req.user = {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is expired or invalid' });
  }
};

export const requireRoles = (roles: ('Employee' | 'Admin' | 'HR')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to perform this action',
      });
      return;
    }
    next();
  };
};
