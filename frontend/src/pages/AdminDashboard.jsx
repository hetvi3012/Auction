import { useState, useEffect } from 'react';
import { adminService, authService } from '../services/api';
import { Activity, Users, DollarSign, Database, AlertCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closingId, setClosingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
         navigate('/login');
         return;
      }

      try {
        const [analyticsData, auctionsData] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getAuctions()
        ]);
        setMetrics(analyticsData.metrics);
        setAuctions(auctionsData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
        setError(err.response?.data?.message || "Failed to load admin dashboard. Ensure you have ADMIN role.");
        
        setMetrics({
            totalVolume: 0,
            totalUsers: 0,
            auctions: { active: 0, completed: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCloseAuction = async (auctionId) => {
    setClosingId(auctionId);
    try {
      await adminService.closeAuction(auctionId);
      const updatedAuctions = await adminService.getAuctions();
      setAuctions(updatedAuctions);
      const analyticsData = await adminService.getAnalytics();
      setMetrics(analyticsData.metrics);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close auction.');
    } finally {
      setClosingId(null);
    }
  };

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
             </div>
         </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Cleared Volume</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                ${metrics?.totalVolume?.toLocaleString() || 0}
              </h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl dark:bg-green-900/20">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Registered Users</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {metrics?.totalUsers?.toLocaleString() || 0}
              </h3>
            </div>
            <div className="p-3 bg-primary-50 rounded-xl dark:bg-primary-900/20">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Auctions</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {metrics?.auctions?.active?.toLocaleString() || 0}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl dark:bg-blue-900/20">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Settled Auctions</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {metrics?.auctions?.completed?.toLocaleString() || 0}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl dark:bg-purple-900/20">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Auction Management Section */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary-600" />
          Auction Management
        </h2>

        {auctions.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">No auctions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Event</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Strategy</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">End Time</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((auction) => (
                  <tr key={auction.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-slate-900 dark:text-white font-medium">
                      {auction.ticket?.eventId || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${auction.strategyType === 'Vickrey' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                        {auction.strategyType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-900 dark:text-white font-semibold">
                      ${auction.currentHighestBid}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        auction.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        auction.status === 'Closed' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {auction.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(auction.endTime).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      {auction.status === 'Active' ? (
                        <button
                          onClick={() => handleCloseAuction(auction.id)}
                          disabled={closingId === auction.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {closingId === auction.id ? 'Closing...' : 'Close Auction'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
