import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../data/db.js';

export interface AuthUser {
  id: string;
  employeeId: string;
  email: string;
  role: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dayflow_hrms_super_secret_jwt_key_2026';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    
    // Verify employee still exists in database
    const employee = db.getEmployeeById(decoded.employeeId);
    if (!employee) {
      res.status(401).json({
        success: false,
        message: 'Invalid session. Employee record not found.'
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

// Middleware to ensure the authenticated user can only access their own resources
export const requireSelfOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const requestedEmployeeId = req.params.employeeId || req.query.employeeId || req.body.employeeId;

  if (requestedEmployeeId && requestedEmployeeId !== req.user.employeeId && req.user.role !== 'admin' && req.user.role !== 'hr') {
    res.status(403).json({
      success: false,
      message: 'Forbidden: You do not have permission to access another employee\'s data.'
    });
    return;
  }

  next();
};
