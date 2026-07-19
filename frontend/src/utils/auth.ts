import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  userId: string;
  email?: string;
  role: 'USER' | 'ADMIN';
}

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

export function getUserEmail(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.email || null;
  } catch {
    return null;
  }
}