import { useState } from 'react';
import type { Vehicle } from '../api/client';
import { X, Tag, Package, Gauge, Fuel, ShieldCheck, ShoppingCart, Plus, Sparkles } from 'lucide-react';

interface VehicleDetailsModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  isAdmin: boolean;
  onAddToCart?: (vehicle: Vehicle) => void;
  onRestock?: (id: string, amount: number) => void;
  isInCart?: boolean;
}

export default function VehicleDetailsModal({
  vehicle,
  onClose,
  isAdmin,
  onAddToCart,
  onRestock,
  isInCart,
}: VehicleDetailsModalProps) {
  const [restockQty, setRestockQty] = useState(1);

  if (!vehicle) return null;

  const inStock = vehicle.quantity > 0;
  const isLowStock = inStock && vehicle.quantity <= 3;
  const stockPercentage = Math.min(100, Math.max(10, (vehicle.quantity / 10) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/40 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Background Decorative Mesh Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/15 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 rounded-full text-xs font-semibold uppercase tracking-wide">
                <Tag size={12} />
                {vehicle.category}
              </span>
              {isLowStock && (
                <span className="animate-pulse px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-500/20">
                  🔥 Only {vehicle.quantity} left in stock!
                </span>
              )}
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {vehicle.year} {vehicle.make}
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">{vehicle.model}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Price & Stock Overview */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl relative z-10">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Starting MSRP</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">${vehicle.price}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Availability</p>
            <div className="flex items-center gap-2 mt-1">
              <Package size={18} className={inStock ? 'text-green-500' : 'text-red-500'} />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {inStock ? `${vehicle.quantity} Units Available` : 'Out of Stock'}
              </span>
            </div>
            {inStock && (
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Specifications & Feature Badges */}
        <div className="space-y-3 relative z-10">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={16} className="text-brand-500" /> Vehicle Highlights & Specifications
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
              <Gauge className="mx-auto text-brand-500 mb-1" size={18} />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">0 - 60 MPH</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">4.8s (Est)</p>
            </div>
            <div className="p-3 bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
              <Fuel className="mx-auto text-brand-500 mb-1" size={18} />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Drivetrain</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">AWD / Sport</p>
            </div>
            <div className="p-3 bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
              <ShieldCheck className="mx-auto text-brand-500 mb-1" size={18} />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Warranty</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">5yr / 60k mi</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {['Leather Trim Seats', 'Panoramic Sunroof', '12.3" Touch Display', 'Adaptive Cruise', 'Wireless CarPlay'].map(
              (feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium"
                >
                  ✓ {feature}
                </span>
              )
            )}
          </div>
        </div>

        {/* Modal Primary Action Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors text-sm"
          >
            Close Specs
          </button>

          {!isAdmin && onAddToCart && (
            <button
              onClick={() => {
                onAddToCart(vehicle);
                onClose();
              }}
              disabled={!inStock}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50 text-sm"
            >
              <ShoppingCart size={18} />
              {isInCart ? 'Add More to Cart' : 'Add to Cart'}
            </button>
          )}

          {isAdmin && onRestock && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Number(e.target.value))}
                className="w-16 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold dark:text-white text-sm"
              />
              <button
                onClick={() => {
                  onRestock(vehicle.id, restockQty);
                  onClose();
                }}
                className="px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-1.5"
              >
                <Plus size={16} /> Add Stock
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
