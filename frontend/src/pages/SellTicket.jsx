import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket as TicketIcon, MapPin, Info, ArrowRight } from 'lucide-react';
import { auctionService, ticketService, authService } from '../services/api';

const SellTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventId: '',
    section: '',
    row: '',
    seat: '',
    strategyType: 'English',
    startingPrice: '',
    durationHours: '1'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const user = authService.getCurrentUser();
        if (!user) {
            alert("Please login first to sell a ticket.");
            navigate('/login');
            return;
        }

        // Step 1: Create the ticket
        const ticket = await ticketService.createTicket({
            eventId: formData.eventId,
            seatInfo: {
                section: formData.section,
                row: formData.row,
                seat: formData.seat
            }
        });

        // Step 2: Create the auction using the ticket ID
        const endTime = new Date(Date.now() + Number(formData.durationHours) * 3600000).toISOString();
        await auctionService.createAuction({
            ticketId: ticket.id,
            strategyType: formData.strategyType,
            startingPrice: Number(formData.startingPrice),
            endTime
        });

        // On success
        navigate('/auctions');
    } catch (error) {
        console.error("Error creating auction", error);
        alert(error.response?.data?.message || "Failed to create auction.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <TicketIcon className="w-8 h-8 text-primary-600" />
          List a Ticket for Auction
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Fill out the details below to create a new auction listing.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Event Details */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <MapPin className="w-5 h-5 text-slate-400" />
              Event Information
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">
                  Event Name or ID
                </label>
                <div className="mt-2 text-slate-900 dark:text-white">
                  <input
                    type="text"
                    name="eventId"
                    value={formData.eventId}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Taylor Swift - The Eras Tour"
                    className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 dark:text-white dark:bg-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">
                    Section
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    placeholder="101"
                    className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-slate-900 dark:text-white dark:bg-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">
                    Row
                  </label>
                  <input
                    type="text"
                    name="row"
                    value={formData.row}
                    onChange={handleChange}
                    placeholder="A"
                    className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-slate-900 dark:text-white dark:bg-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">
                    Seat
                  </label>
                  <input
                    type="text"
                    name="seat"
                    value={formData.seat}
                    onChange={handleChange}
                    placeholder="12"
                    className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-slate-900 dark:text-white dark:bg-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Auction Settings */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 mt-8">
              <Info className="w-5 h-5 text-slate-400" />
              Auction Format
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div
                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                  formData.strategyType === 'English'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, strategyType: 'English' }))}
              >
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">English Auction</h3>
                <p className="text-sm border-slate-900 dark:text-slate-400">Open ascending price. Bidders see the current highest bid and compete to raise it until time runs out.</p>
              </div>

              <div
                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                  formData.strategyType === 'Vickrey'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, strategyType: 'Vickrey' }))}
              >
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Vickrey Auction</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Sealed-bid format. Highest bidder wins but pays the <span className="font-medium text-purple-600 dark:text-purple-400">second-highest</span> bid amount.</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">
                Starting Price ($)
              </label>
              <div className="mt-2 relative rounded-md shadow-sm max-w-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-slate-400 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  required
                  min="1"
                  className="block w-full rounded-xl border-0 py-3 pl-8 pr-4 text-slate-900 dark:text-white dark:bg-slate-800 ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">
                Auction Duration (hours)
              </label>
              <div className="mt-2 max-w-xs">
                <select
                  name="durationHours"
                  value={formData.durationHours}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 dark:text-white dark:bg-slate-800 ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center gap-2 rounded-xl bg-slate-900 dark:bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 dark:shadow-primary-600/20 hover:bg-slate-800 dark:hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Start Auction <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SellTicket;
