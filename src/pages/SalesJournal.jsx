import React, { useState, useEffect } from 'react';
import { saveTransaction, getTransactions, deleteTransaction } from '../utils/storage'; 
import rawProducts from '../data/pos_item.json'; 
import { PlusCircle, Save, Trash2, Info, Package, Tag, AlertTriangle } from 'lucide-react'; 

const productsData = rawProducts.map((item, index) => ({
  ...item,
  id: index + 101,
  name: item.itemName,
  price: item.unitPrice,
  inventory: item.inventory,
  description: item.description 
}));

const SalesJournal = () => {
  const [sales, setSales] = useState([]);
  
  const [formData, setFormData] = useState({
    productId: '',
    qty: 1,
    date: new Date().toISOString().split('T')[0],
    customCategory: '' 
  });

  const selectedProduct = productsData.find(p => p.id === parseInt(formData.productId));
  
  const totalSold = sales
    .filter(sale => sale.productId === parseInt(formData.productId))
    .reduce((sum, sale) => sum + sale.qty, 0);

  const currentStock = selectedProduct ? selectedProduct.inventory - totalSold : 0;
  const estimatedTotal = selectedProduct ? selectedProduct.price * formData.qty : 0;

  // --- NEW: Real-time Check ---
  // Is the user asking for more than we have?
  const isOverStock = selectedProduct && parseInt(formData.qty) > currentStock;

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

    if (isOverStock) return; // Stop if invalid

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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      deleteTransaction(id);
      setSales(getTransactions()); 
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-50 sticky top-24">
           <div className="flex items-center gap-2 mb-6">
            <PlusCircle className="text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">New Transaction</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            
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
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedProduct && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-sm">
                <div className="flex items-start gap-2 text-slate-600">
                  <Info className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                  <p className="italic">{selectedProduct.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">฿{selectedProduct.price}/unit</span>
                  </div>
                  <div className={`flex items-center gap-2 font-medium ${currentStock < 10 ? 'text-red-600' : 'text-slate-600'}`}>
                    <Package className="w-4 h-4" />
                    <span>Stock: {currentStock}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Quantity</label>
                <input 
                  type="number" 
                  name="qty" 
                  min="1" 
                  // Removed 'max' attribute to stop native tooltip from appearing
                  value={formData.qty} 
                  onChange={handleInputChange} 
                  className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 transition
                    ${isOverStock 
                      ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-600' 
                      : 'border-slate-300 focus:ring-indigo-500 bg-white'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleInputChange} 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
            </div>

            {/* --- NEW: VISIBLE ERROR MESSAGE --- */}
            {isOverStock && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  <strong>Error:</strong> Not enough stock! (Max: {currentStock})
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Custom Category <span className="text-xs text-slate-400">(Optional)</span></label>
              <input type="text" name="customCategory" placeholder="e.g. Staff Meal" value={formData.customCategory} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg flex justify-between items-center mt-6">
              <span className="text-indigo-900 font-medium">Total Price:</span>
              <span className="text-2xl font-bold text-indigo-700">฿{estimatedTotal.toLocaleString()}</span>
            </div>

            <button 
              type="submit" 
              // Disable if No Product OR Over Stock OR Out of Stock
              disabled={!selectedProduct || isOverStock || currentStock <= 0}
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-lg 
                ${(!selectedProduct || isOverStock || currentStock <= 0) 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
            >
              <Save className="w-5 h-5" /> 
              {/* Button Text Logic */}
              {isOverStock ? 'Quantity Exceeds Stock' : 
               (selectedProduct && currentStock <= 0) ? 'Out of Stock' : 'Save Record'}
            </button>
          </form>
        </div>
      </div>

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