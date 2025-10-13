import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount, currency = 'DOP') => {
  const symbols = {
    DOP: 'RD$',
    USD: '$',
    EUR: '€',
  };

  const symbol = symbols[currency] || currency;
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol}${formattedAmount}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return dateString;
  }
};

export const getCurrencySymbol = (currency) => {
  const symbols = {
    DOP: 'RD$',
    USD: '$',
    EUR: '€',
  };
  return symbols[currency] || currency;
};
