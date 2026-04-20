import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { User, Wallet, History, PlusCircle, Trophy, Clock, ArrowUpRight } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpMessage, setTopUpMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const data = await authService.getProfile();
        setProfile(data.user);
        setBids(data.bids);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleTopUp = async () => {
    setTopUpMessage(null);
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      setTopUpMessage({ type: 'error', text: 'Enter a valid amount.' });
      return;
    }

    setTopUpLoading(true);
    try {
      const result = await authService.topUp(amount);
      setProfile(prev => ({ ...prev, walletBalance: result.walletBalance }));
      setTopUpAmount('');
      setTopUpMessage({ type: 'success', text: `Added $${amount}. New balance: $${result.walletBalance}` });
    } catch (error) {
      setTopUpMessage({ type: 'error', text: error.response?.data?.message || 'Top-up failed.' });
    } finally {
      setTopUpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 dark:text-slate-400">Failed to load profile. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Profile Header */}
      <div className="glass-panel rounded-2xl p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {profile.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
            <p className="text-slate-500 dark:text-slate-400">{profile.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${profile.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                {profile.role}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Wallet Balance</h2>
          </div>
          <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            ${profile.walletBalance?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Available for bidding</p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <PlusCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Up Wallet</h2>
          </div>

          {topUpMessage && (
            <div className={`mb-3 px-3 py-2 rounded-lg text-sm font-medium ${
              topUpMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {topUpMessage.text}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="1"
              disabled={topUpLoading}
            />
            <button
              onClick={handleTopUp}
              disabled={topUpLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              {topUpLoading ? 'Adding...' : 'Add Funds'}
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            {[100, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => setTopUpAmount(String(amount))}
                className="px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                +${amount}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bid History */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bid History</h2>
          <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">{bids.length} bid(s)</span>
        </div>

        {bids.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No bids placed yet.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Go to Active Auctions to start bidding!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Auction Type</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Auction Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Result</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid) => {
                  const isWinner = bid.auction?.winningBidderId === profile.id && bid.auction?.status === 'Closed';
                  const isActive = bid.auction?.status === 'Active';

                  return (
                    <tr key={bid.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4 text-sm font-bold text-slate-900 dark:text-white">
                        ${bid.amount}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${bid.auction?.strategyType === 'Vickrey' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                          {bid.auction?.strategyType || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {bid.auction?.status || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {isActive ? (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Pending</span>
                        ) : isWinner ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                            <Trophy className="w-3.5 h-3.5" /> Won
                          </span>
                        ) : bid.auction?.status === 'Closed' ? (
                          <span className="text-xs text-red-500 dark:text-red-400 font-medium">Outbid</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(bid.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
