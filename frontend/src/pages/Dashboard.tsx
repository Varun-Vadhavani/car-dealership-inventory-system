import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchVehicles, purchaseVehicle, searchVehicles, SearchFilters } from '../api/client';

export default function Dashboard() {
  const queryClient = useQueryClient();

  // Controlled inputs for the search form fields
  const [make, setMake] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // activeFilters is only updated on submit, not on every keystroke —
  // this is what actually triggers the query to re-run, since it's
  // part of the queryKey. Typing alone doesn't fire a request.
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null);

  const { data: vehicles, isLoading, error } = useQuery({
    // queryKey includes activeFilters — React Query treats a changed
    // key as "this is different data, refetch." When activeFilters
    // is null we're not searching, so queryFn falls back to fetchVehicles.
    queryKey: ['vehicles', activeFilters],
    queryFn: () => (activeFilters ? searchVehicles(activeFilters) : fetchVehicles()),
  });

  const purchaseMutation = useMutation({
    mutationFn: (id: string) => purchaseVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setActiveFilters({ make, minPrice, maxPrice });
  }

  if (isLoading) return <p className="text-center mt-8">Loading vehicles...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">Failed to load vehicles.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label htmlFor="make" className="block text-sm font-medium">
            Search by make
          </label>
          <input
            id="make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="mt-1 rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium">
            Min price
          </label>
          <input
            id="minPrice"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="mt-1 rounded border px-3 py-2 w-28"
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium">
            Max price
          </label>
          <input
            id="maxPrice"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="mt-1 rounded border px-3 py-2 w-28"
          />
        </div>
        <button type="submit" className="rounded bg-gray-800 text-white px-4 py-2 font-medium">
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vehicles?.map((vehicle) => (
          <div key={vehicle.id} className="border rounded p-4 flex flex-col gap-2">
            <h2 className="font-semibold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
            <p className="text-sm text-gray-600">{vehicle.category}</p>
            <p className="font-medium">${vehicle.price}</p>
            <p className="text-sm">In stock: {vehicle.quantity}</p>
            <button
              onClick={() => purchaseMutation.mutate(vehicle.id)}
              disabled={vehicle.quantity === 0 || purchaseMutation.isPending}
              className="rounded bg-blue-600 text-white py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchaseMutation.isPending ? 'Purchasing...' : 'Purchase'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}