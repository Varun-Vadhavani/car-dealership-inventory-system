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

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  price: string; // Decimal serializes as a string over JSON, per backend
  quantity: number;
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const response = await fetch(`${API_BASE_URL}/vehicles`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch vehicles');
  }
  return response.json();
}