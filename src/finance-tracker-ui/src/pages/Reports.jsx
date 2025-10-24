import { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import DateRangePicker from '../components/DateRangePicker';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import SpendingPieChart from '../components/reports/SpendingPieChart';
import TrendsLineChart from '../components/reports/TrendsLineChart';
import ComparisonBarChart from '../components/reports/ComparisonBarChart';
import CashflowAreaChart from '../components/reports/CashflowAreaChart';
import TopExpensesTable from '../components/reports/TopExpensesTable';
import {
  getSpendingByCategory,
  getTrends,
  getComparison,
  getCashflow,
  getTopExpenses
} from '../services/reportsService';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('spending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(currentDate), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(currentDate), 'yyyy-MM-dd'));
  const [months, setMonths] = useState(12);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [topLimit, setTopLimit] = useState(10);

  // Data states
  const [spendingData, setSpendingData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [cashflowData, setCashflowData] = useState(null);
  const [topExpensesData, setTopExpensesData] = useState(null);

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab, startDate, endDate, months, year, topLimit]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'spending':
          if (!spendingData) {
            const response = await getSpendingByCategory(startDate, endDate);
            setSpendingData(response.data);
          }
          break;
        case 'trends':
          if (!trendsData) {
            const response = await getTrends(months);
            setTrendsData(response.data);
          }
          break;
        case 'comparison':
          if (!comparisonData) {
            const currentStart = startDate;
            const currentEnd = endDate;
            const previousStart = format(subMonths(new Date(startDate), 1), 'yyyy-MM-dd');
            const previousEnd = format(subMonths(new Date(endDate), 1), 'yyyy-MM-dd');
            const response = await getComparison(currentStart, currentEnd, previousStart, previousEnd);
            setComparisonData(response.data);
          }
          break;
        case 'cashflow':
          if (!cashflowData) {
            const response = await getCashflow(year);
            setCashflowData(response.data);
          }
          break;
        case 'topExpenses':
          if (!topExpensesData) {
            const response = await getTopExpenses(startDate, endDate, topLimit);
            setTopExpensesData(response.data);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    // Clear cached data for current tab to force refresh
    switch (activeTab) {
      case 'spending':
        setSpendingData(null);
        break;
      case 'trends':
        setTrendsData(null);
        break;
      case 'comparison':
        setComparisonData(null);
        break;
      case 'cashflow':
        setCashflowData(null);
        break;
      case 'topExpenses':
        setTopExpensesData(null);
        break;
      default:
        break;
    }
  };

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    // Clear relevant cached data
    setSpendingData(null);
    setComparisonData(null);
    setTopExpensesData(null);
  };

  const tabs = [
    { id: 'spending', label: 'Spending Analysis', icon: '📊' },
    { id: 'trends', label: 'Trends', icon: '📈' },
    { id: 'comparison', label: 'Period Comparison', icon: '⚖️' },
    { id: 'cashflow', label: 'Cashflow', icon: '💰' },
    { id: 'topExpenses', label: 'Top Expenses', icon: '🔝' }
  ];

  const renderFilters = () => {
    switch (activeTab) {
      case 'spending':
      case 'comparison':
      case 'topExpenses':
        return (
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
              />
            </div>
            {activeTab === 'topExpenses' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limit
                </label>
                <select
                  value={topLimit}
                  onChange={(e) => {
                    setTopLimit(Number(e.target.value));
                    setTopExpensesData(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                  <option value={50}>Top 50</option>
                </select>
              </div>
            )}
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        );
      case 'trends':
        return (
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period (Months)
              </label>
              <select
                value={months}
                onChange={(e) => {
                  setMonths(Number(e.target.value));
                  setTrendsData(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months</option>
                <option value={18}>18 Months</option>
                <option value={24}>24 Months</option>
              </select>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        );
      case 'cashflow':
        return (
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  setCashflowData(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return <ErrorAlert message={error} onClose={() => setError(null)} />;
    }

    switch (activeTab) {
      case 'spending':
        return <SpendingPieChart data={spendingData} />;
      case 'trends':
        return <TrendsLineChart data={trendsData} />;
      case 'comparison':
        return <ComparisonBarChart data={comparisonData} />;
      case 'cashflow':
        return <CashflowAreaChart data={cashflowData} />;
      case 'topExpenses':
        return <TopExpensesTable data={topExpensesData} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="mt-2 text-sm text-gray-600">
          Analyze your financial data with detailed reports and visualizations
        </p>
      </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          {renderFilters()}
        </div>

      {/* Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Reports;
