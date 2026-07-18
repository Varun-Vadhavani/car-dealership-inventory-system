import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../src/pages/Login';

describe('Login page', () => {
  it('should render email and password inputs and a submit button', () => {
    render(<Login />);

    // Using accessible queries (label text, role) rather than test-ids —
    // this is the React Testing Library philosophy: test what a user
    // would actually see/interact with, not implementation details.
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('should show a validation error if submitted with empty fields', async () => {
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
    });
  });
});