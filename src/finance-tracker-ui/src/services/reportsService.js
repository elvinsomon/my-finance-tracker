import api from './api';

/**
 * Get spending breakdown by category for a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise} Response with spending by category data
 */
export const getSpendingByCategory = async (startDate, endDate) => {
  const response = await api.get('/reports/spending-by-category', {
    params: { startDate, endDate }
  });
  return response;
};

/**
 * Get income/expense trends over time
 * @param {number} months - Number of months to analyze (default: 12)
 * @returns {Promise} Response with trends data
 */
export const getTrends = async (months = 12) => {
  if (months < 1 || months > 24) {
    throw new Error('Months must be between 1 and 24');
  }
  const response = await api.get('/reports/trends', {
    params: { months }
  });
  return response;
};

/**
 * Compare current period vs previous period
 * @param {string} currentStart - Current period start date (YYYY-MM-DD)
 * @param {string} currentEnd - Current period end date (YYYY-MM-DD)
 * @param {string} previousStart - Previous period start date (YYYY-MM-DD)
 * @param {string} previousEnd - Previous period end date (YYYY-MM-DD)
 * @returns {Promise} Response with comparison data
 */
export const getComparison = async (currentStart, currentEnd, previousStart, previousEnd) => {
  const response = await api.get('/reports/comparison', {
    params: {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd
    }
  });
  return response;
};

/**
 * Get cashflow analysis for a year
 * @param {number} year - Year to analyze
 * @returns {Promise} Response with cashflow data
 */
export const getCashflow = async (year) => {
  const currentYear = new Date().getFullYear();
  if (year < 2000 || year > currentYear + 1) {
    throw new Error(`Year must be between 2000 and ${currentYear + 1}`);
  }
  const response = await api.get('/reports/cashflow', {
    params: { year }
  });
  return response;
};

/**
 * Get top expenses for a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {number} limit - Number of top expenses to return (default: 10)
 * @returns {Promise} Response with top expenses data
 */
export const getTopExpenses = async (startDate, endDate, limit = 10) => {
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }
  const response = await api.get('/reports/top-expenses', {
    params: { startDate, endDate, limit }
  });
  return response;
};
