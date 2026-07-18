import { Request, Response } from 'express';
import { registerUser } from '../services/auth.service';

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await registerUser(email, password);
    return res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}