import { useState } from 'react';
import type { Vehicle } from '../api/client';
import { Tag, Package, Eye, Pencil, Trash2, Plus, ShoppingCart, Car } from 'lucide-react';

// Curated realistic vehicle photo mapping by category/make
const CAR_IMAGES: Record<string, string> = {
  sedan: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  truck: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
  suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
  coupe: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  luxury: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
};

interface VehicleCardProps {
  vehicle: Vehicle;
  isAdmin: boolean;
  isInCart: boolean;
  onViewSpecs: (vehicle: Vehicle) => void;
  onAddToCart: (vehicle: Vehicle) => void;
  onStartEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onRestock: (id: string, amount: number) => void;
  restockAmount: number;
  onRestockAmountChange: (amount: number) => void;
}

export default function VehicleCard({
  vehicle,
  isAdmin,
  isInCart,
  onViewSpecs,
  onAddToCart,
  onStartEdit,
  onDelete,
  onRestock,
  restockAmount,
  onRestockAmountChange,
}: VehicleCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const inStock = vehicle.quantity > 0;
  const isLowStock = inStock && vehicle.quantity <= 3;

  const categoryKey = vehicle.category.toLowerCase();
  const imageUrl = vehicle.imageUrl || CAR_IMAGES[categoryKey] || CAR_IMAGES.default;

  return (
    <article
      className={`group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full overflow-hidden ${
        !inStock ? 'opacity-90' : ''
      }`}
    >
      {/* Vehicle Image Container */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center text-slate-400">
            <Car size={32} />
          </div>
        )}
        {!imageError ? (
          <img
            src={imageUrl}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400">
            <Car size={40} />
          </div>
        )}

        {/* Category Badge overlay */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <span className="px-3 py-1 bg-slate-900/70 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-wide border border-white/20 shadow-sm flex items-center gap-1">
            <Tag size={12} />
            {vehicle.category}
          </span>
        </div>

        {/* Admin Quick Action Floating Bar */}
        {isAdmin && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-900/70 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-sm">
            <button
              onClick={() => onStartEdit(vehicle)}
              className="p-1.5 text-white hover:text-brand-300 hover:bg-white/10 rounded-lg transition-colors"
              title="Edit vehicle"
              aria-label={`Edit ${vehicle.make} ${vehicle.model}`}
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(vehicle.id)}
              className="p-1.5 text-white hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
              title="Delete vehicle"
              aria-label={`Delete ${vehicle.make} ${vehicle.model}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Vehicle Info Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {vehicle.year} {vehicle.make}
            </h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{vehicle.model}</p>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            ${vehicle.price}
          </div>
        </div>

        {/* Low Stock Urgency Indicator */}
        {isLowStock && (
          <div className="my-2 flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold animate-pulse">
            <span>🔥 Only {vehicle.quantity} left in stock!</span>
          </div>
        )}

        {/* Vehicle Footer Info */}
        <div className="mt-auto pt-4 space-y-3">
          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <Package size={15} className={inStock ? 'text-green-500' : 'text-red-500'} />
              <span className={inStock ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-red-500 font-medium'}>
                {inStock ? `${vehicle.quantity} Units Available` : 'Out of Stock'}
              </span>
            </div>
            <button
              onClick={() => onViewSpecs(vehicle)}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <Eye size={13} /> Specs
            </button>
          </div>

          {/* Admin Restock Section */}
          {isAdmin && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={restockAmount}
                onChange={(e) => onRestockAmountChange(Number(e.target.value))}
                className="w-16 px-2 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold dark:text-white text-center outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                onClick={() => onRestock(vehicle.id, restockAmount)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <Plus size={14} /> Add Stock
              </button>
            </div>
          )}

          {/* Customer Action Button */}
          {!isAdmin && (
            <button
              onClick={() => onAddToCart(vehicle)}
              disabled={!inStock}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500 disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500 transition-all duration-300 shadow-md shadow-brand-500/10"
            >
              {inStock ? (
                <>
                  <ShoppingCart size={16} />
                  {isInCart ? 'Add More to Cart' : 'Add to Cart'}
                </>
              ) : (
                'Sold Out'
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
