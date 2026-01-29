import React, { useState, useEffect } from 'react';
// 1. Import deleteTransaction
import { saveTransaction, getTransactions, deleteTransaction } from '../utils/storage'; 
import productsData from '../data/product-item.json';
// 2. Import Trash2 icon
import { PlusCircle, Save, Trash2 } from 'lucide-react'; 

const SalesJournal = () => {
  const [sales, setSales] = useState([]);
  
  const [formData, setFormData] = useState({
    productId: '',
    qty: 1,
    date: new Date().toISOString().split('T')[0],
    customCategory: '' 
  });

  const selectedProduct = productsData.find(p => p.id === parseInt(formData.productId));
  const estimatedTotal = selectedProduct ? selectedProduct.price * formData.qty : 0;

  useEffect(() => {
    setSales(getTransactions());
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return alert("Please select a product");

    const newSale = {
      id: Date.now(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: formData.customCategory.trim() || selectedProduct.category, 
      qty: parseInt(formData.qty),
      date: formData.date,
      total: estimatedTotal
    };

    saveTransaction(newSale);
    setSales(getTransactions()); 
    setFormData(prev => ({ ...prev, productId: '', qty: 1, customCategory: '' }));
  };

  // --- 3. ADD DELETE HANDLER ---
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      deleteTransaction(id);      // Remove from storage
      setSales(getTransactions()); // Refresh the UI immediately
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Left Column (Form) - Same as before ... */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-50 sticky top-24">
           {/* ... (Keep your existing form code here) ... */}
           {/* Just copying the wrapper for context, don't delete your form! */}
           <div className="flex items-center gap-2 mb-6">
            <PlusCircle className="text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">New Transaction</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
             {/* ... form inputs ... */}
             {/* ... copy your existing inputs here ... */}
             <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Product Item</label>
              <select 
                name="productId" 
                value={formData.productId}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-50"
                required
              >
                <option value="">-- Select Item --</option>
                {productsData.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (฿{p.price})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Quantity</label>
                <input type="number" name="qty" min="1" value={formData.qty} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Custom Category <span className="text-xs text-slate-400">(Optional)</span></label>
              <input type="text" name="customCategory" placeholder="e.g. Staff Meal, Gift" value={formData.customCategory} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg flex justify-between items-center mt-6">
              <span className="text-indigo-900 font-medium">Total Price:</span>
              <span className="text-2xl font-bold text-indigo-700">฿{estimatedTotal.toLocaleString()}</span>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
              <Save className="w-5 h-5" /> Save Record
            </button>
          </form>
        </div>
      </div>

      {/* Right Column (Table) */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800">Transaction History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b">Date</th>
                  <th className="p-4 font-semibold border-b">Product</th>
                  <th className="p-4 font-semibold border-b">Category</th>
                  <th className="p-4 font-semibold border-b text-center">Qty</th>
                  <th className="p-4 font-semibold border-b text-right">Total</th>
                  {/* 4. ADD ACTION HEADER */}
                  <th className="p-4 font-semibold border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 text-slate-600 text-sm whitespace-nowrap">{sale.date}</td>
                    <td className="p-4 font-medium text-slate-800">{sale.productName}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {sale.category}
                      </span>
                    </td>
                    <td className="p-4 text-center text-slate-600">{sale.qty}</td>
                    <td className="p-4 text-right font-bold text-indigo-600">฿{sale.total.toLocaleString()}</td>
                    
                    {/* 5. ADD DELETE BUTTON CELL */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(sale.id)} 
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesJournal;