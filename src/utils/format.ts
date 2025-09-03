export const formatCurrency = (amount: number) => {
  try {
    return new Intl.NumberFormat('en-IL', { style: 'currency', currency: 'ILS' }).format(amount ?? 0);
  } catch {
    const v = Number(amount ?? 0);
    return `${formatCurrency(v.toFixed(2))}`;
  }
};