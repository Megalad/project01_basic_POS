const STORAGE_KEY = 'sales_app_v1';

// Seed data so charts aren't empty on first load
const INITIAL_DATA = [
  { id: 1, productId: 101, productName: "Espresso Shot", category: "Coffee", qty: 2, total: 120, date: '2025-01-20' },
  { id: 2, productId: 106, productName: "Blueberry Cheesecake", category: "Bakery", qty: 1, total: 150, date: '2025-01-20' },
  { id: 3, productId: 102, productName: "Iced Americano", category: "Coffee", qty: 5, total: 400, date: '2025-01-19' },
  { id: 4, productId: 104, productName: "Green Tea Latte", category: "Tea", qty: 3, total: 270, date: '2025-01-18' },
  { id: 5, productId: 107, productName: "Croissant", category: "Bakery", qty: 10, total: 850, date: '2025-01-15' }
];

export const getTransactions = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // If empty, save initial data immediately so we have something to show
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(data);
};

export const saveTransaction = (transaction) => {
  const currentData = getTransactions();
  const newData = [transaction, ...currentData]; // Add new item to top
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
};

// Helper to clear data if needed (optional)
export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};
export const deleteTransaction = (id) => {
  const currentData = getTransactions();
  // Filter out the item with the matching ID
  const newData = currentData.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
};