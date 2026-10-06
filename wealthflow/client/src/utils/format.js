export function formatCurrency(amount, currency = 'INR') {
  if (amount === undefined || amount === null || Number.isNaN(amount)) amount = 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
