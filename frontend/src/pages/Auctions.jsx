import { useState, useEffect } from 'react';
import { auctionService, authService } from '../services/api';
import { useSocket } from '../utils/useSocket';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        // Since DB might not be running locally, we mock for UI demonstration 
        // if the API call fails or until backend is fully hooked up.
        try {
           const data = await auctionService.getActiveAuctions();
           setAuctions(data);
        } catch (error) {
           console.log("Using mock data for UI demo. Backend API unavailable.");
           setAuctions([
             {
               _id: '1',
               ticketId: { eventId: 'Taylor Swift - Eras Tour', seatInfo: { section: '101', row: 'A', seat: '12' } },
               strategyType: 'English',
               currentHighestBid: 450,
               endTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
             },
             {
               _id: '2',
               ticketId: { eventId: 'TechConf 2026 VIP Pass', seatInfo: { section: 'VIP' } },
               strategyType: 'Vickrey',
               currentHighestBid: 800,
               endTime: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
             }
           ]);
        }
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
          <AuctionCard key={auction._id} auction={auction} />
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
  const { latestBid } = useSocket(auction._id);
  const [currentPrice, setCurrentPrice] = useState(auction.currentHighestBid);

  useEffect(() => {
    if (latestBid && latestBid.amount > currentPrice) {
      setCurrentPrice(latestBid.amount);
    }
  }, [latestBid]);

  const isVickrey = auction.strategyType === 'Vickrey';

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
        {auction.ticketId?.eventId}
      </h3>
      
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow">
        <p>Section: {auction.ticketId?.seatInfo?.section || 'N/A'}</p>
        <p>Row: {auction.ticketId?.seatInfo?.row || 'N/A'} | Seat: {auction.ticketId?.seatInfo?.seat || 'N/A'}</p>
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
        
        <button className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-medium py-2.5 rounded-xl transition-colors">
          Place Bid
        </button>
      </div>
    </div>
  );
};

export default Auctions;
