import { useState, useEffect } from 'react';
import { adminService, authService } from '../services/api';
import { Activity, Users, DollarSign, Database, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
         navigate('/login');
         return;
      }

      try {
        const data = await adminService.getAnalytics();
        setMetrics(data.metrics);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        setError(err.response?.data?.message || "Failed to load admin dashboard. Ensure you have ADMIN role.");
        
        // Mock data for demonstration purposes if unauthorized/down
        setMetrics({
            totalVolume: 54300,
            totalUsers: 142,
            auctions: {
               active: 12,
               completed: 45
            }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary-600" />
          Enterprise Analytics Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Real-time system health and platform metrics (Role-Based Access Control).
        </p>
      </div>

      {error && (
         <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
             <div>
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Access Restricted</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-2 font-medium bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded inline-block">Showing Fallback Mock Data</p>
             </div>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Cleared Volume</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                ${metrics?.totalVolume.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl dark:bg-green-900/20">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-4 font-medium flex items-center gap-1">
             +12.5% <span className="text-slate-500 dark:text-slate-400 font-normal">from last month</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Registered Users</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {metrics?.totalUsers.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-primary-50 rounded-xl dark:bg-primary-900/20">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Auctions</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {metrics?.auctions.active.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl dark:bg-blue-900/20">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
             Currently processing live bids
          </p>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Settled Auctions</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {metrics?.auctions.completed.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl dark:bg-purple-900/20">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
