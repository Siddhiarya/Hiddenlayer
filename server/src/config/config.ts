import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  jwtSecret: process.env.JWT_SECRET || 'dayflow_super_secret_jwt_key_2026',
  jwtExpiresIn: '7d',
  corsOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ]
};
