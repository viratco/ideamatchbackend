import express, { Request, Response } from 'express';
import { createUser, validateUser, verifyUserByToken } from '../services/userService';
import { generateToken } from '../services/jwtService';

const router = express.Router();

// Sign up
router.post('/signup', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const user = await createUser(name, email, password);
    // Auto-login after signup
    const token = generateToken(user);
    res.status(201).json({ message: 'Signup successful!', token, user });
  } catch (err: any) {
    if (err.code === '23505') {
      // Unique violation
      return res.status(409).json({ error: 'Email already in use.' });
    }
    return res.status(500).json({ error: 'Server error.' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await validateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


export default router;
