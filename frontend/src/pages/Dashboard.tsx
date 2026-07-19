import { useState, useEffect, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchVehicles, purchaseVehicle, searchVehicles, createVehicleRequest, type SearchFilters } from '../api/client';
import { getUserRole } from '../utils/auth';
import { Search, Plus, Tag, DollarSign, Package, Car, ShoppingCart, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const isAdmin = getUserRole() === 'ADMIN';

  const [make, setMake] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null);

  useEffect(() => {
    // This is our "debounce". We wait 400ms after the user stops typing
    // before we trigger the search. This prevents spamming the backend
    // on every single keystroke.
    const handler = setTimeout(() => {
      if (make || minPrice || maxPrice) {
        setActiveFilters({ make, minPrice, maxPrice });
      } else {
        // If all fields are empty, clear the active filters so it fetches all
        setActiveFilters(null);
      }
    }, 400);

    // If the user types again before 400ms, the previous timer is cleared
    // and a new one starts.
    return () => clearTimeout(handler);
  }, [make, minPrice, maxPrice]);

  const [showAddForm, setShowAddForm] = useState(false);
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
      setNewMake('');
      setNewModel('');
      setNewYear('');
      setNewCategory('');
      setNewPrice('');
      setNewQuantity('');
      setAddError('');
      setShowAddForm(false);
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

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Top Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              placeholder="Search make..."
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-white placeholder:text-slate-400 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24 px-3 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-white placeholder:text-slate-400 text-sm"
            />
            <span className="text-slate-400">-</span>
            <input
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 px-3 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-white placeholder:text-slate-400 text-sm"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            Filter
          </button>
        </form>

        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors shadow-md shadow-brand-500/20"
          >
            <Plus size={18} />
            Add Vehicle
          </button>
        )}
      </div>

      {/* Admin Add Form */}
      {isAdmin && showAddForm && (
        <form onSubmit={handleAddVehicle} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-brand-100 dark:border-brand-900/50 p-6 rounded-2xl shadow-lg shadow-brand-500/5 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-slate-900 dark:text-white">
            <Car className="text-brand-500" /> New Vehicle
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <input placeholder="Make (e.g. Toyota)" value={newMake} onChange={(e) => setNewMake(e.target.value)} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none dark:text-white" required />
            <input placeholder="Model (e.g. Camry)" value={newModel} onChange={(e) => setNewModel(e.target.value)} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none dark:text-white" required />
            <input placeholder="Year" type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none dark:text-white" required />
            <input placeholder="Category (e.g. Sedan)" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none dark:text-white" required />
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input placeholder="Price" type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none dark:text-white" required />
            </div>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input placeholder="Quantity" type="number" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none dark:text-white" required />
            </div>
          </div>
          {addError && (
            <div className="mb-4 flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg text-sm border border-red-100 dark:border-red-500/20">
              <AlertCircle size={16} /> <p>{addError}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-brand-500/20 disabled:opacity-50">
              {createMutation.isPending ? 'Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      )}

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800/50 rounded-2xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load inventory.</p>
        </div>
      ) : vehicles?.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Car className="mx-auto text-slate-400 mb-3" size={32} />
          <p className="text-slate-500 dark:text-slate-400">No vehicles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles?.map((vehicle) => {
            const inStock = vehicle.quantity > 0;
            return (
              <div key={vehicle.id} className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full relative overflow-hidden">
                
                {/* Decorative background blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-colors pointer-events-none" />

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {vehicle.year} {vehicle.make}
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300">{vehicle.model}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 rounded-full text-xs font-semibold uppercase tracking-wide">
                    <Tag size={12} />
                    {vehicle.category}
                  </span>
                </div>

                <div className="mt-auto space-y-4 relative z-10">
                  <div className="flex items-center justify-between py-3 border-y border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                      <Package size={16} className={inStock ? "text-green-500" : "text-red-500"} />
                      <span className={inStock ? "text-slate-700 dark:text-slate-300 font-medium" : "text-red-500 font-medium"}>
                        {inStock ? `${vehicle.quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      ${vehicle.price}
                    </div>
                  </div>

                  <button
                    onClick={() => purchaseMutation.mutate(vehicle.id)}
                    disabled={!inStock || purchaseMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 transition-all duration-300"
                  >
                    {purchaseMutation.isPending ? (
                      'Processing...'
                    ) : inStock ? (
                      <>
                        <ShoppingCart size={18} />
                        Purchase Now
                      </>
                    ) : (
                      'Sold Out'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}