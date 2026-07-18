// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../src/pages/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as apiClient from '../src/api/client';

describe('Login page', () => {
  it('should render email and password inputs and a submit button', () => {
    renderWithProviders(<Login />);

    // Using accessible queries (label text, role) rather than test-ids —
    // this is the React Testing Library philosophy: test what a user
    // would actually see/interact with, not implementation details.
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('should show a validation error if submitted with empty fields', async () => {
    renderWithProviders(<Login />);

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
    });
  });
});

// Wraps the component in React Query's provider, required for any
// component using useMutation/useQuery. A fresh QueryClient per test
// avoids cached state leaking between tests.
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Login page - API integration', () => {
  it('should store the token in localStorage on successful login', async () => {
    // Mock the network call so this test doesn't depend on a real
    // backend running — we're testing the component's behavior in
    // response to a successful API call, not the API itself (that's
    // already covered by the backend's own integration tests).
    vi.spyOn(apiClient, 'loginRequest').mockResolvedValue({ token: 'fake-jwt-token' });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    });
  });

  it('should show an error message on failed login', async () => {
    vi.spyOn(apiClient, 'loginRequest').mockRejectedValue(new Error('Invalid credentials'));

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});