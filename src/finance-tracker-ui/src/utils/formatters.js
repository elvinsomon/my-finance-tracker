import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount, currency = 'DOP', options = {}) => {
  const symbols = {
    DOP: 'RD$',
    USD: '$',
    EUR: '€',
  };

  const symbol = symbols[currency] || currency;
  const formatOptions = {
    minimumFractionDigits: options.notation === 'compact' ? 0 : 2,
    maximumFractionDigits: options.notation === 'compact' ? 1 : 2,
    ...options,
  };

  const formattedAmount = new Intl.NumberFormat('en-US', formatOptions).format(amount);

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
