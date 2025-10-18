import { useState, useEffect } from 'react';
import savingsGoalService from '../services/savingsGoalService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import GoalProgressCard from '../components/GoalProgressCard';
import GoalModal from '../components/GoalModal';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

const SavingsGoals = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('active');
  const [sortBy, setSortBy] = useState('priority');
  const { user } = useAuth();

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [goals, filterStatus, sortBy]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await savingsGoalService.getAll();
      setGoals(response.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...goals];

    // Apply status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(goal => !goal.isCompleted);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(goal => goal.isCompleted);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        return (b.priority || 0) - (a.priority || 0);
      } else if (sortBy === 'progress') {
        const percentA = a.targetAmount > 0 ? (a.currentAmount / a.targetAmount) * 100 : 0;
        const percentB = b.targetAmount > 0 ? (b.currentAmount / b.targetAmount) * 100 : 0;
        return percentB - percentA;
      } else if (sortBy === 'date') {
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return new Date(a.targetDate) - new Date(b.targetDate);
      } else if (sortBy === 'amount') {
        return b.targetAmount - a.targetAmount;
      }
      return 0;
    });

    setFilteredGoals(filtered);
  };

  const handleCreateGoal = () => {
    setSelectedGoal(null);
    setShowModal(true);
  };

  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
    setShowModal(true);
  };

  const handleDeleteGoal = async (goal) => {
    if (!window.confirm(`Are you sure you want to delete "${goal.name}"?`)) {
      return;
    }

    try {
      setError(null);
      await savingsGoalService.delete(goal.id);
      await fetchGoals();
    } catch (err) {
      setError(err);
    }
  };

  const handleModalClose = async (refresh) => {
    setShowModal(false);
    setSelectedGoal(null);
    if (refresh) {
      await fetchGoals();
    }
  };

  const calculateSummary = () => {
    const activeGoals = goals.filter(g => !g.isCompleted);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const overallPercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      totalSaved,
      totalTarget,
      overallPercentage,
      activeGoalsCount: activeGoals.length,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const summary = calculateSummary();

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-600">Track and manage your financial goals</p>
        </div>
        <button
          onClick={handleCreateGoal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </div>

      <ErrorAlert
        message={error?.message}
        errors={error?.errors}
        onClose={() => setError(null)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Saved</dt>
                <dd className="text-xl font-semibold text-gray-900">
                  {formatCurrency(summary.totalSaved, user?.defaultCurrency)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Target</dt>
                <dd className="text-xl font-semibold text-gray-900">
                  {formatCurrency(summary.totalTarget, user?.defaultCurrency)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Overall Progress</dt>
                <dd className="text-xl font-semibold text-purple-600">
                  {summary.overallPercentage.toFixed(1)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Goals</dt>
                <dd className="text-xl font-semibold text-gray-900">
                  {summary.activeGoalsCount}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-sm"
            >
              <option value="priority">Priority</option>
              <option value="progress">Progress</option>
              <option value="date">Target Date</option>
              <option value="amount">Target Amount</option>
            </select>
          </div>
        </div>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No savings goals yet</h3>
          <p className="text-gray-600 mb-6">
            {filterStatus === 'active'
              ? 'Start building your financial future by creating your first savings goal.'
              : filterStatus === 'completed'
              ? 'You have no completed goals yet.'
              : 'Create your first savings goal to get started.'}
          </p>
          {filterStatus !== 'completed' && (
            <button
              onClick={handleCreateGoal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md inline-flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalProgressCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      {showModal && (
        <GoalModal
          goal={selectedGoal}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default SavingsGoals;
