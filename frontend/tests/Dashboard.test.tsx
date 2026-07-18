import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../src/pages/Dashboard';
import * as apiClient from '../src/api/client';
import { getUserRole } from '../src/utils/auth';

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

  it('should call purchaseVehicle when the purchase button is clicked', async () => {
  vi.spyOn(apiClient, 'fetchVehicles').mockResolvedValue([
    { id: '1', make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: '24999.99', quantity: 5 },
  ]);
  const purchaseSpy = vi.spyOn(apiClient, 'purchaseVehicle').mockResolvedValue(
    { id: '1', make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: '24999.99', quantity: 4 }
  );

  renderWithProviders(<Dashboard />);

  const button = await screen.findByRole('button', { name: /purchase/i });
  fireEvent.click(button);

  await waitFor(() => {
    expect(purchaseSpy).toHaveBeenCalledWith('1');
  });
});

  it('should call searchVehicles with the make filter when the search form is submitted', async () => {
  vi.spyOn(apiClient, 'fetchVehicles').mockResolvedValue([]);
  const searchSpy = vi.spyOn(apiClient, 'searchVehicles').mockResolvedValue([
    { id: '1', make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: '24999.99', quantity: 5 },
  ]);

  renderWithProviders(<Dashboard />);

  fireEvent.change(await screen.findByLabelText(/search by make/i), { target: { value: 'Honda' } });
  fireEvent.click(screen.getByRole('button', { name: /search/i }));

  await waitFor(() => {
    expect(searchSpy).toHaveBeenCalledWith({ make: 'Honda', minPrice: '', maxPrice: '' });
  });
});

vi.mock('../src/utils/auth', () => ({
  getUserRole: vi.fn(),
}));

// ...inside the describe block:

it('should show the Add Vehicle form only for admins', async () => {
  vi.spyOn(apiClient, 'fetchVehicles').mockResolvedValue([]);
  vi.mocked(getUserRole).mockReturnValue('ADMIN');

  renderWithProviders(<Dashboard />);

  expect(await screen.findByRole('button', { name: /add vehicle/i })).toBeInTheDocument();
});

it('should NOT show the Add Vehicle form for regular users', async () => {
  vi.spyOn(apiClient, 'fetchVehicles').mockResolvedValue([]);
  vi.mocked(getUserRole).mockReturnValue('USER');

  renderWithProviders(<Dashboard />);

  await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
  expect(screen.queryByRole('button', { name: /add vehicle/i })).not.toBeInTheDocument();
});
});