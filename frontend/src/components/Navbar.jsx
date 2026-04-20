import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ticket, Menu, X, ShieldAlert, UserCircle } from 'lucide-react';
import { authService } from '../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Basic auth check for UI rendering purposes
    setUser(authService.getCurrentUser());
  }, [location]);

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <Ticket className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">FairPlay Auctions</span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link to="/auctions" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors">
                Active Auctions
              </Link>
              <Link to="/sell" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors">
                Sell Ticket
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
             {user?.role === 'ADMIN' && (
                 <Link to="/admin" className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-purple-200 dark:border-purple-800 text-sm font-medium rounded-lg text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                    <ShieldAlert className="w-4 h-4" /> Admin Panel
                 </Link>
             )}

              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                     <UserCircle className="w-4 h-4" /> My Profile
                  </Link>
                  <Link to="/profile" className="text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                     Balance: ${user.walletBalance?.toLocaleString() || '0'}
                  </Link>
                  <button onClick={() => { authService.logout(); window.location.href='/'; }} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Sign Out</button>
                </div>
             ) : (
               <>
                 <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                    Sign In
                 </Link>
                 <Link to="/register" className="inline-flex justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors">
                    Get Started
                 </Link>
               </>
             )}
          </div>

          {/* ... mobile menu toggle omitted for brevity ... */}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
