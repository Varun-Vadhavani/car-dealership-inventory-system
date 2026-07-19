import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { Moon, Sun, CarFront, LogOut, ShoppingBag } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import { CartProvider, useCart } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { getUserRole } from './utils/auth';

function NavbarContent({ isDarkMode, setIsDarkMode, handleLogout, showNavButtons }: {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  handleLogout: () => void;
  showNavButtons: boolean;
}) {
  const { totalCount } = useCart();
  const isAdmin = getUserRole() === 'ADMIN';

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="p-2 bg-brand-500 rounded-lg text-white shadow-lg shadow-brand-500/30">
              <CarFront size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
              AutoLuxe
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {showNavButtons && (
              <>
                {!isAdmin && (
                  <Link
                    to="/cart"
                    className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5 font-medium text-sm"
                    aria-label="View shopping cart"
                  >
                    <ShoppingBag size={20} />
                    <span className="hidden sm:inline">Cart</span>
                    {totalCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                        {totalCount}
                      </span>
                    )}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  const showNavButtons = Boolean(token && location.pathname !== '/login' && location.pathname !== '/register');

  return (
    <ToastProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col transition-colors duration-300">
          <NavbarContent
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            handleLogout={handleLogout}
            showNavButtons={showNavButtons}
          />

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-500/10 dark:bg-brand-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="relative z-10">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;