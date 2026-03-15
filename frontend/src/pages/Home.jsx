import { ArrowRight, Ticket as TicketIcon, TrendingUp, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col gap-16 pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-primary-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>
        
        <div className="text-center max-w-3xl mx-auto px-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6">
            Bid. Win. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">Experience.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            The premier marketplace for exclusive event tickets. Engage in fair, transparent English and Vickrey sealed-bid auctions. Don't miss out on the events you love.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/auctions" className="rounded-full bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-primary-500/30 hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              Explore Auctions <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/sell" className="text-sm font-semibold leading-6 text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Sell a ticket <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">Why choose us</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            A Better Way to Buy Tickets
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-xl text-primary-600 dark:text-primary-400 mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Fair Value Discovery</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Our Vickrey-style auctions incentivize bidding your true max, ensuring you pay fair market value.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-xl text-emerald-600 dark:text-emerald-400 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Secure Escrow</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Funds are safely held during the auction and instantly refunded to outbid users. 100% scam-free transfers.</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl text-purple-600 dark:text-purple-400 mb-4">
              <TicketIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Exclusive Access</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Access tickets to sold-out concerts, sporting events, and tech conferences from verified sellers.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
