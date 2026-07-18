import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../src/pages/Dashboard';
import * as apiClient from '../src/api/client';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Dashboard', () => {
  it('should display a list of vehicles', async () => {
    vi.spyOn(apiClient, 'fetchVehicles').mockResolvedValue([
      { id: '1', make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: '24999.99', quantity: 5 },
      { id: '2', make: 'Ford', model: 'F-150', year: 2024, category: 'Truck', price: '45999.99', quantity: 0 },
    ]);

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/honda civic/i)).toBeInTheDocument();
      expect(screen.getByText(/ford f-150/i)).toBeInTheDocument();
    });
  });

  it('should disable the purchase button when quantity is 0', async () => {
    vi.spyOn(apiClient, 'fetchVehicles').mockResolvedValue([
      { id: '2', make: 'Ford', model: 'F-150', year: 2024, category: 'Truck', price: '45999.99', quantity: 0 },
    ]);

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /purchase/i })).toBeDisabled();
    });
  });
});