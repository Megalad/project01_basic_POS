import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Store } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import SalesJournal from './pages/SalesJournal';

const Navbar = () => {
  const location = useLocation();
  
  const getLinkClass = (path) => {
    const baseClass = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200";
    const activeClass = "bg-indigo-600 text-white shadow-md shadow-indigo-200 transform scale-105";
    const inactiveClass = "text-slate-600 hover:bg-slate-100 hover:text-indigo-600";
    
    return location.pathname === path ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
            <Store className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700 tracking-tight">
            Badds Station
          </span>
        </div>

        <div className="flex gap-2">
          <Link to="/" className={getLinkClass('/')}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link to="/journal" className={getLinkClass('/journal')}>
            <ReceiptText className="w-4 h-4" />
            Journal
          </Link>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
        <Navbar />
        <main className="max-w-7xl mx-auto py-8 px-4 md:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<SalesJournal />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;