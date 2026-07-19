import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { purchaseVehicle } from '../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserRole } from '../utils/auth';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';

export default function Cart() {
  const isAdmin = getUserRole() === 'ADMIN';
  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, tax, totalBill } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // Execute a purchase for each unit of each vehicle in the cart
      for (const item of cartItems) {
        for (let i = 0; i < item.quantity; i++) {
          await purchaseVehicle(item.vehicle.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      clearCart();
      setCheckoutSuccess(true);
    },
    onError: (err: Error) => {
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
    },
  });

  function handleCheckout() {
    setCheckoutError('');
    checkoutMutation.mutate();
  }

  if (checkoutSuccess) {
    return (
      <div className="w-full max-w-lg mx-auto mt-16 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-8 rounded-3xl shadow-xl animate-in zoom-in-95 duration-300">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={56} />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Order Confirmed!</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Thank you for your purchase with AutoLuxe. Your order has been placed successfully and stock has been updated.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-brand-500/20"
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto mt-16 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-10 rounded-3xl shadow-lg">
        <ShoppingBag className="mx-auto text-slate-400 mb-4" size={56} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Cart is Empty</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Looks like you haven't added any vehicles to your cart yet.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white rounded-xl font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Explore Showroom
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft size={18} /> Continue Shopping
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="text-brand-500" /> Your Shopping Cart
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartItems.map(({ vehicle, quantity }) => {
            const itemTotal = Number(vehicle.price) * quantity;
            return (
              <div
                key={vehicle.id}
                className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {vehicle.category} • ${vehicle.price} / unit
                  </p>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50">
                    <button
                      onClick={() => updateQuantity(vehicle.id, quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3 font-semibold text-slate-900 dark:text-white text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(vehicle.id, quantity + 1)}
                      disabled={quantity >= vehicle.quantity}
                      className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Price Subtotal */}
                  <div className="text-right min-w-[90px]">
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      ${itemTotal.toFixed(2)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(vehicle.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Bill Panel */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-6 rounded-3xl shadow-lg h-fit flex flex-col gap-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
            Order Summary
          </h2>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Estimated Tax & Fees (8%)</span>
              <span className="font-semibold text-slate-900 dark:text-white">${tax.toFixed(2)}</span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900 dark:text-white">Total Bill</span>
              <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                ${totalBill.toFixed(2)}
              </span>
            </div>
          </div>

          {checkoutError && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg text-sm border border-red-100 dark:border-red-500/20">
              <AlertCircle size={16} />
              <p>{checkoutError}</p>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={checkoutMutation.isPending}
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkoutMutation.isPending ? 'Processing Order...' : 'Complete Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}
