import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
}

// Reads the role out of the stored JWT without verifying its
// signature — verification isn't the frontend's job (the backend
// already verified it when issuing it, and re-verifies it on every
// protected request). This is purely "what should I show this user,"
// not a security boundary.
export function getUserRole(): 'USER' | 'ADMIN' | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.role;
  } catch {
    return null;
  }
}