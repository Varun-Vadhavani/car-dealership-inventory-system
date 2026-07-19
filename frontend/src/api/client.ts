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
  imageUrl?: string;
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

export async function purchaseVehicle(id: string): Promise<Vehicle> {
  const response = await fetch(`${API_BASE_URL}/vehicles/${id}/purchase`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || 'Purchase failed');
  }
  return response.json();
}

export interface SearchFilters {
  make?: string;
  minPrice?: string;
  maxPrice?: string;
}

export async function searchVehicles(filters: SearchFilters): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filters.make) params.set('make', filters.make);
  if (filters.minPrice) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

  const response = await fetch(`${API_BASE_URL}/vehicles/search?${params}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Search failed');
  return response.json();
}

export interface CreateVehicleInput {
  make: string;
  model: string;
  year: number;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export async function createVehicleRequest(data: CreateVehicleInput): Promise<Vehicle> {
  const response = await fetch(`${API_BASE_URL}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || 'Failed to create vehicle');
  }
  return response.json();
}

export async function restockVehicle(id: string, amount: number): Promise<Vehicle> {
  const response = await fetch(`${API_BASE_URL}/vehicles/${id}/restock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || 'Failed to restock vehicle');
  }
  return response.json();
}

export async function deleteVehicleRequest(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to delete vehicle');
  }
}

export async function updateVehicleRequest(
  id: string,
  data: Partial<CreateVehicleInput>
): Promise<Vehicle> {
  const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || 'Failed to update vehicle');
  }
  return response.json();
}