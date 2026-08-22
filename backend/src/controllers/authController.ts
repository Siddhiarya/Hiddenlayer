import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../data/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dayflow_hrms_super_secret_jwt_key_2026';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
      return;
    }

    const employee = db.getEmployeeByEmail(email);
    if (!employee || !employee.password) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    const isMatch = bcrypt.compareSync(password, employee.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    const tokenPayload = {
      id: employee.id,
      employeeId: employee.employeeId,
      email: employee.email,
      name: employee.name,
      role: employee.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // Exclude password from returned user object
    const { password: _, ...safeEmployee } = employee;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeEmployee
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred during login.',
      error: error.message
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const employee = db.getEmployeeById(req.user.employeeId);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found.' });
      return;
    }

    const { password: _, ...safeEmployee } = employee;

    res.status(200).json({
      success: true,
      user: safeEmployee
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve current user.',
      error: error.message
    });
  }
};
