import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auctions from './pages/Auctions';
import SellTicket from './pages/SellTicket';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard'; // Phase 2 Extension

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
             <Route path="/" element={<Home />} />
             <Route path="/auctions" element={<Auctions />} />
             <Route path="/sell" element={<SellTicket />} />
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
             <Route path="/profile" element={<Profile />} />
             <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
