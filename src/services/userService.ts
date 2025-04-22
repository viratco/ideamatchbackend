import dotenv from 'dotenv';
dotenv.config();

console.log('DB ENV:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

import { Pool } from 'pg';
import { User } from '../types/user';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendVerificationEmail } from './emailService';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});


export async function createUser(name: string, email: string, password: string): Promise<User> {
  let result;
  try {
    const hashed = await bcrypt.hash(password, 10);
    result = await pool.query(
      'INSERT INTO users (name, email, password, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, password, created_at, is_verified, verification_token',
      [name, email, hashed, null, null]
    );
  } catch (err: any) {
    if (err.code === '23505') {
      // Duplicate email error, don't send email
      console.error('Duplicate email error in createUser:', email);
    } else {
      console.error('Error in createUser:', err);
    }
    throw err;
  }
  
  return result.rows[0];
}

export async function verifyUserByToken(token: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING id',
      [token]
    );
    // rowCount may be undefined/null, treat falsy as 0
    return (result.rowCount ?? 0) > 0;
  } catch (err) {
    console.error('Error in verifyUserByToken:', err);
    return false;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await pool.query(
      'SELECT id, name, email, password, created_at, is_verified, verification_token FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('Error in findUserByEmail:', err);
    return null;
  }
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  try {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const match = await bcrypt.compare(password, user.password);
  return match ? user : null;
  } catch (err) {
    console.error('Error in validateUser:', err);
    return null;
  }
}
