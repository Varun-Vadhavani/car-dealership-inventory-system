import { useState, useEffect, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchVehicles,
  purchaseVehicle,
  searchVehicles,
  createVehicleRequest,
  restockVehicle,
  deleteVehicleRequest,
  updateVehicleRequest,
  type SearchFilters,
  type Vehicle,
} from '../api/client';
import { getUserRole } from '../utils/auth';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import {
  Search,
  Plus,
  Tag,
  DollarSign,
  Package,
  Car,
  ShoppingCart,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  TrendingUp,
  Sparkles,
  Layers,
  Eye,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

const CATEGORY_PILLS = ['ALL', 'Sedan', 'SUV', 'Truck', 'Coupe', 'Luxury'];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const isAdmin = getUserRole() === 'ADMIN';
  const { addToCart, cartItems } = useCart();
  const { showToast } = useToast();

  const [make, setMake] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null);
  const [restockAmounts, setRestockAmounts] = useState<Record<string, number>>({});
  const [selectedVehicleForSpecs, setSelectedVehicleForSpecs] = useState<Vehicle | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      const filters: SearchFilters = {};
      if (make) filters.make = make;
      if (minPrice) filters.minPrice = minPrice;
      if (maxPrice) filters.maxPrice = maxPrice;

      if (Object.keys(filters).length > 0) {
        setActiveFilters(filters);
      } else {
        setActiveFilters(null);
      }
    }, 400);

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

  // Edit Vehicle State
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editMake, setEditMake] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editError, setEditError] = useState('');

  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['vehicles', activeFilters],
    queryFn: () => (activeFilters ? searchVehicles(activeFilters) : fetchVehicles()),
  });

  const purchaseMutation = useMutation({
    mutationFn: (id: string) => purchaseVehicle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const restockMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => restockVehicle(id, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setRestockAmounts((prev) => ({ ...prev, [variables.id]: 1 }));
      showToast(`Added ${variables.amount} unit(s) of stock!`, 'success');
    },
    onError: (err: Error) => showToast(err.message || 'Restock failed', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVehicleRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      showToast('Vehicle removed from inventory', 'info');
    },
    onError: (err: Error) => showToast(err.message || 'Delete failed', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Parameters<typeof createVehicleRequest>[0]> }) =>
      updateVehicleRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setEditingVehicle(null);
      setEditError('');
      showToast('Vehicle details updated successfully', 'success');
    },
    onError: (err: Error) => setEditError(err.message),
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
      showToast('New vehicle added to inventory!', 'success');
    },
    onError: (err: Error) => setAddError(err.message),
  });

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const filters: SearchFilters = {};
    if (make) filters.make = make;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    setActiveFilters(Object.keys(filters).length > 0 ? filters : null);
  }

  function handleCategoryPillClick(category: string) {
    setSelectedCategory(category);
    if (category === 'ALL') {
      setMake('');
    } else {
      setMake(category);
    }
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

  function handleRestock(id: string) {
    const amount = restockAmounts[id] ?? 1;
    if (amount > 0) {
      restockMutation.mutate({ id, amount });
    }
  }

  function handleAddToCartWithToast(vehicle: Vehicle) {
    addToCart(vehicle);
    showToast(`${vehicle.make} ${vehicle.model} added to cart!`, 'success');
  }

  function handleStartEdit(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setEditMake(vehicle.make);
    setEditModel(vehicle.model);
    setEditYear(String(vehicle.year));
    setEditCategory(vehicle.category);
    setEditPrice(vehicle.price);
    setEditQuantity(String(vehicle.quantity));
    setEditError('');
  }

  function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingVehicle) return;
    updateMutation.mutate({
      id: editingVehicle.id,
      data: {
        make: editMake,
        model: editModel,
        year: Number(editYear),
        category: editCategory,
        price: Number(editPrice),
        quantity: Number(editQuantity),
      },
    });
  }

  function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this vehicle from inventory?')) {
      deleteMutation.mutate(id);
    }
  }

  // Calculate Admin Metrics
  const totalValuation = vehicles?.reduce((sum, v) => sum + Number(v.price) * v.quantity, 0) || 0;
  const totalUnits = vehicles?.reduce((sum, v) => sum + v.quantity, 0) || 0;
  const alertCount = vehicles?.filter((v) => v.quantity <= 3).length || 0;

  // Filter vehicles visually if category pill selected
  const displayedVehicles = vehicles?.filter((v) => {
    if (selectedCategory === 'ALL') return true;
    return (
      v.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      v.make.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* 1. Admin Analytics Banner (Admin Exclusive) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Inventory Valuation</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Units in Stock</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{totalUnits} Units</p>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Low / Out-of-Stock Alerts</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{alertCount} Models</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Customer Showroom Hero Header (Non-Admin) */}
      {!isAdmin && (
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-slate-800 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-brand-500/30">
              <Sparkles size={14} /> Luxury Collection 2026
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Explore High Performance & Comfort</h1>
            <p className="text-slate-400 text-sm">
              Discover curated luxury sedans, rugged off-road trucks, and premium SUVs built for the ultimate driving experience.
            </p>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
              <p className="text-2xl font-black text-white">{vehicles?.length || 0}</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Available Models</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
              <p className="text-2xl font-black text-brand-400">4.9/5</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Customer Rating</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Search Bar & Top Control Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-none min-w-[220px]">
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

        {/* 4. Quick Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <SlidersHorizontal size={14} /> Category:
          </span>
          {CATEGORY_PILLS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryPillClick(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-brand-500/20 scale-105'
                    : 'bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
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

      {/* Edit Vehicle Modal */}
      {isAdmin && editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <form onSubmit={handleSaveEdit} className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="text-brand-500" size={20} /> Edit Vehicle Details
              </h2>
              <button type="button" onClick={() => setEditingVehicle(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Make</label>
                <input value={editMake} onChange={(e) => setEditMake(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Model</label>
                <input value={editModel} onChange={(e) => setEditModel(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Year</label>
                <input type="number" value={editYear} onChange={(e) => setEditYear(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Category</label>
                <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Price ($)</label>
                <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Stock Quantity</label>
                <input type="number" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-sm" required />
              </div>
            </div>

            {editError && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg text-sm border border-red-100 dark:border-red-500/20">
                <AlertCircle size={16} /> <p>{editError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditingVehicle(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={updateMutation.isPending} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all shadow-md disabled:opacity-50">
                {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interactive Specs Drawer Modal */}
      <VehicleDetailsModal
        vehicle={selectedVehicleForSpecs}
        onClose={() => setSelectedVehicleForSpecs(null)}
        isAdmin={isAdmin}
        onAddToCart={handleAddToCartWithToast}
        onRestock={handleRestock}
        isInCart={cartItems.some((item) => item.vehicle.id === selectedVehicleForSpecs?.id)}
      />

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800/50 rounded-2xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load inventory.</p>
        </div>
      ) : displayedVehicles?.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Car className="mx-auto text-slate-400 mb-3" size={32} />
          <p className="text-slate-500 dark:text-slate-400">No vehicles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedVehicles?.map((vehicle) => {
            const inStock = vehicle.quantity > 0;
            const isLowStock = inStock && vehicle.quantity <= 3;

            return (
              <div
                key={vehicle.id}
                className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full relative overflow-hidden"
              >
                {/* Decorative background blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-colors pointer-events-none" />

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {vehicle.year} {vehicle.make}
                      </h2>
                    </div>
                    <p className="text-lg text-slate-600 dark:text-slate-300">{vehicle.model}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 rounded-full text-xs font-semibold uppercase tracking-wide">
                      <Tag size={12} />
                      {vehicle.category}
                    </span>
                    {isAdmin && (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleStartEdit(vehicle)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit vehicle"
                          aria-label={`Edit ${vehicle.make} ${vehicle.model}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete vehicle"
                          aria-label={`Delete ${vehicle.make} ${vehicle.model}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Stock & Specs Trigger Bar */}
                <div className="mt-auto space-y-4 relative z-10">
                  {/* Low Stock Warning Pill */}
                  {isLowStock && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold animate-pulse">
                      <span>🔥 Only {vehicle.quantity} left in stock!</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-3 border-y border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                      <Package size={16} className={inStock ? 'text-green-500' : 'text-red-500'} />
                      <span
                        className={
                          inStock ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-red-500 font-medium'
                        }
                      >
                        {inStock ? `${vehicle.quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      ${vehicle.price}
                    </div>
                  </div>

                  {/* View Specs Trigger Button */}
                  <button
                    onClick={() => setSelectedVehicleForSpecs(vehicle)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Eye size={14} /> View Specifications & Features
                  </button>

                  {/* Admin Restock Section */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={restockAmounts[vehicle.id] ?? 1}
                        onChange={(e) =>
                          setRestockAmounts({ ...restockAmounts, [vehicle.id]: Number(e.target.value) })
                        }
                        className="w-16 px-2 py-1.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white text-center outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        onClick={() => handleRestock(vehicle.id)}
                        disabled={restockMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <Plus size={14} />
                        Add Stock
                      </button>
                    </div>
                  )}

                  {/* Customer Add to Cart */}
                  {!isAdmin && (
                    <button
                      onClick={() => handleAddToCartWithToast(vehicle)}
                      disabled={!inStock}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 transition-all duration-300 shadow-md"
                    >
                      {inStock ? (
                        <>
                          <ShoppingCart size={18} />
                          {cartItems.some((item) => item.vehicle.id === vehicle.id)
                            ? 'Add More to Cart'
                            : 'Add to Cart'}
                        </>
                      ) : (
                        'Sold Out'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}