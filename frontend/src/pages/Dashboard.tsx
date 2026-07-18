import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchVehicles, purchaseVehicle, searchVehicles, createVehicleRequest, type SearchFilters } from '../api/client';
import { getUserRole } from '../utils/auth';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const isAdmin = getUserRole() === 'ADMIN';

  const [make, setMake] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null);

  // New-vehicle form fields, kept separate from the search form's
  // `make` state above — same field name, different concern, so
  // no shared state between them.
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [addError, setAddError] = useState('');

  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['vehicles', activeFilters],
    queryFn: () => (activeFilters ? searchVehicles(activeFilters) : fetchVehicles()),
  });

  const purchaseMutation = useMutation({
    mutationFn: (id: string) => purchaseVehicle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const createMutation = useMutation({
    mutationFn: createVehicleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      // Reset the form after a successful add
      setNewMake('');
      setNewModel('');
      setNewYear('');
      setNewCategory('');
      setNewPrice('');
      setNewQuantity('');
      setAddError('');
    },
    onError: (err: Error) => setAddError(err.message),
  });

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setActiveFilters({ make, minPrice, maxPrice });
  }

  function handleAddVehicle(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      make: newMake,
      model: newModel,
      year: Number(newYear),
      category: newCategory,
      price: Number(newPrice),
      quantity: Number(newQuantity),
    });
  }

  if (isLoading) return <p className="text-center mt-8">Loading vehicles...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">Failed to load vehicles.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label htmlFor="make" className="block text-sm font-medium">Search by make</label>
          <input id="make" value={make} onChange={(e) => setMake(e.target.value)} className="mt-1 rounded border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium">Min price</label>
          <input id="minPrice" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="mt-1 rounded border px-3 py-2 w-28" />
        </div>
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium">Max price</label>
          <input id="maxPrice" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="mt-1 rounded border px-3 py-2 w-28" />
        </div>
        <button type="submit" className="rounded bg-gray-800 text-white px-4 py-2 font-medium">Search</button>
      </form>

      {isAdmin && (
        <form onSubmit={handleAddVehicle} className="border rounded p-4 mb-6 flex flex-wrap gap-3 items-end bg-gray-50">
          <h2 className="w-full font-semibold">Add Vehicle</h2>
          <input placeholder="Make" value={newMake} onChange={(e) => setNewMake(e.target.value)} className="rounded border px-3 py-2" required />
          <input placeholder="Model" value={newModel} onChange={(e) => setNewModel(e.target.value)} className="rounded border px-3 py-2" required />
          <input placeholder="Year" type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)} className="rounded border px-3 py-2 w-24" required />
          <input placeholder="Category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="rounded border px-3 py-2" required />
          <input placeholder="Price" type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="rounded border px-3 py-2 w-28" required />
          <input placeholder="Quantity" type="number" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} className="rounded border px-3 py-2 w-24" required />
          <button type="submit" disabled={createMutation.isPending} className="rounded bg-green-600 text-white px-4 py-2 font-medium disabled:opacity-50">
            {createMutation.isPending ? 'Adding...' : 'Add Vehicle'}
          </button>
          {addError && <p className="text-red-600 text-sm w-full">{addError}</p>}
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vehicles?.map((vehicle) => (
          <div key={vehicle.id} className="border rounded p-4 flex flex-col gap-2">
            <h2 className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</h2>
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