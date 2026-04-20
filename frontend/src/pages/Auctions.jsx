import { useState, useEffect } from 'react';
import { auctionService, authService, bidService } from '../services/api';
import { useSocket } from '../utils/useSocket';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const data = await auctionService.getActiveAuctions();
        setAuctions(data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Active Auctions</h1>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Updates
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
      
      {auctions.length === 0 && (
         <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">No active auctions right now. Check back later!</p>
         </div>
      )}
    </div>
  );
};

const AuctionCard = ({ auction }) => {
  // Integrate real-time socket updates per card
  const { latestBid } = useSocket(auction.id);
  const [currentPrice, setCurrentPrice] = useState(auction.currentHighestBid);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  useEffect(() => {
    if (latestBid && latestBid.amount > currentPrice) {
      setCurrentPrice(latestBid.amount);
    }
  }, [latestBid]);

  const isVickrey = auction.strategyType === 'Vickrey';

  const handlePlaceBid = async () => {
    setMessage(null);

    // Check if user is logged in
    const user = authService.getCurrentUser();
    if (!user || !user.token) {
      setMessage({ type: 'error', text: 'Please log in to place a bid.' });
      return;
    }

    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid bid amount.' });
      return;
    }

    if (amount <= currentPrice) {
      setMessage({ type: 'error', text: `Bid must be higher than $${currentPrice}.` });
      return;
    }

    setBidding(true);
    try {
      const result = await bidService.placeBid({ auctionId: auction.id, amount });
      setCurrentPrice(amount);
      setBidAmount('');
      setMessage({ type: 'success', text: 'Bid placed successfully!' });
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to place bid.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setBidding(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${isVickrey ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'}`}>
          {auction.strategyType} Auction
        </span>
        <span className="text-xs text-slate-500 font-medium">
          Ends: {new Date(auction.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
        {auction.ticket?.eventId}
      </h3>
      
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow">
        <p>Section: {auction.ticket?.seatInfo?.section || 'N/A'}</p>
        <p>Row: {auction.ticket?.seatInfo?.row || 'N/A'} | Seat: {auction.ticket?.seatInfo?.seat || 'N/A'}</p>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-auto">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">
              {isVickrey ? 'Current Max Bid' : 'Current Bid'}
            </p>
            <p className={`text-2xl font-bold ${latestBid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
              ${currentPrice}
            </p>
          </div>
        </div>

        {message && (
          <div className={`mb-3 px-3 py-2 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="number"
            placeholder={`Min $${currentPrice + 1}`}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            min={currentPrice + 1}
            step="1"
            disabled={bidding}
          />
          <button
            onClick={handlePlaceBid}
            disabled={bidding}
            className="px-5 bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bidding ? 'Placing...' : 'Bid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auctions;
