import React, { useEffect, useState, useMemo } from 'react';
import { getTransactions } from '../utils/storage';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Calendar } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState('daily'); // 'daily' or 'monthly'

  useEffect(() => {
    setData(getTransactions());
  }, []);

  // --- Calculations ---

  // 1. Total Sales
  const totalSales = data.reduce((acc, curr) => acc + curr.total, 0);
  const totalOrders = data.length;

  // 2. Prepare Chart Data (Line Chart)
  const chartData = useMemo(() => {
    const grouped = {};
    data.forEach(item => {
      // If filter is monthly, slice date to YYYY-MM
      const key = filterType === 'monthly' ? item.date.slice(0, 7) : item.date;
      grouped[key] = (grouped[key] || 0) + item.total;
    });
    
    return Object.keys(grouped)
      .sort()
      .map(date => ({ date, sales: grouped[date] }));
  }, [data, filterType]);

  // 3. Prepare Category Data (Pie Chart)
  const pieData = useMemo(() => {
    const grouped = {};
    data.forEach(item => {
      grouped[item.category] = (grouped[item.category] || 0) + item.total;
    });
    return Object.keys(grouped).map(name => ({ name, value: grouped[name] }));
  }, [data]);

  // 4. Top 5 Items Logic
  const topItems = useMemo(() => {
    const counts = {};
    data.forEach(item => {
      counts[item.productName] = (counts[item.productName] || 0) + parseInt(item.qty);
    });
    
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a) // Sort descending
      .slice(0, 5) // Take top 5
      .map(([name, qty]) => ({ name, qty }));
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-500">Real-time sales insights and performance.</p>
        </div>
        
        <div className="bg-white p-1 rounded-lg border border-slate-200 flex shadow-sm">
          <button 
            onClick={() => setFilterType('daily')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${filterType === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Daily
          </button>
          <button 
            onClick={() => setFilterType('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${filterType === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={DollarSign} label="Total Revenue" value={`฿${totalSales.toLocaleString()}`} color="indigo" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders} color="emerald" />
        <StatCard icon={TrendingUp} label="Best Seller" value={topItems[0]?.name || "N/A"} color="amber" />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-6">Sales Trends ({filterType})</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `฿${val}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-6">Sales by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Items Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-700 mb-6">Top 5 Best Selling Items</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 14}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="qty" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Small Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;