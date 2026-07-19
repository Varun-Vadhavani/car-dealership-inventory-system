import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Cart from '../src/pages/Cart';
import { CartProvider, useCart } from '../src/context/CartContext';
import { useEffect } from 'react';

function HelperComponent() {
  const { addToCart } = useCart();
  useEffect(() => {
    addToCart({
      id: '1',
      make: 'Honda',
      model: 'Civic',
      year: 2024,
      category: 'Sedan',
      price: '25000.00',
      quantity: 5,
    });
  }, [addToCart]);
  return <Cart />;
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CartProvider>{ui}</CartProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Cart Page', () => {
  it('should display empty cart state when no items added', () => {
    renderWithProviders(<Cart />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('should display added items and total bill', () => {
    renderWithProviders(<HelperComponent />);
    expect(screen.getByText(/2024 honda civic/i)).toBeInTheDocument();
    expect(screen.getByText(/total bill/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /complete purchase/i })).toBeInTheDocument();
  });
});
