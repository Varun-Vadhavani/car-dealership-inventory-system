const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function loginRequest(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    // Backend returns { error: "..." } on 401/400 — surface that message
    const body = await response.json();
    throw new Error(body.error || 'Login failed');
  }

  return response.json(); // { token }
}

export async function registerRequest(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || 'Registration failed');
  }

  return response.json(); // { id, email, role, createdAt }
}