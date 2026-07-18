import { useQuery } from '@tanstack/react-query';
import { fetchVehicles } from '../api/client';

export default function Dashboard() {
  // useQuery: declarative "give me this data" — React Query handles
  // the fetch on mount, caching, loading/error states, and refetching,
  // without us manually managing useEffect + useState for any of it.
  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });

  if (isLoading) return <p className="text-center mt-8">Loading vehicles...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">Failed to load vehicles.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {vehicles?.map((vehicle) => (
        <div key={vehicle.id} className="border rounded p-4 flex flex-col gap-2">
          <h2 className="font-semibold">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h2>
          <p className="text-sm text-gray-600">{vehicle.category}</p>
          <p className="font-medium">${vehicle.price}</p>
          <p className="text-sm">In stock: {vehicle.quantity}</p>
          <button
            disabled={vehicle.quantity === 0}
            className="rounded bg-blue-600 text-white py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Purchase
          </button>
        </div>
      ))}
    </div>
  );
}