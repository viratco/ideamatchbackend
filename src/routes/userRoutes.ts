import express, { Request, Response } from 'express';
import { createUser, validateUser, verifyUserByToken } from '../services/userService';
import { generateToken } from '../services/jwtService';

const router = express.Router();

// Authentication (signup, login) is now handled by Supabase Auth via the frontend.
// These routes are no longer needed in the backend.


export default router;
