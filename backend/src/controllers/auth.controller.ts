import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await registerUser(email, password);
    return res.status(201).json(user);
  } catch (error: any) {
    // P2002 = Prisma's unique constraint violation code (duplicate email)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const token = await loginUser(email, password);

  // Generic 401 regardless of *why* login failed — see loginUser's
  // comment for why we don't distinguish "no such user" from
  // "wrong password" at any layer of this request.
  if (!token) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.status(200).json({ token });
}