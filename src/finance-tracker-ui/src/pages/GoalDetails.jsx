import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import savingsGoalService from '../services/savingsGoalService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import GoalModal from '../components/GoalModal';
import ContributeModal from '../components/ContributeModal';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

const GoalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goal, setGoal] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);

  useEffect(() => {
    fetchGoalDetails();
  }, [id]);

  const fetchGoalDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [goalData, contributionsData] = await Promise.all([
        savingsGoalService.getById(id),
        savingsGoalService.getContributions(id),
      ]);
      setGoal(goalData.data);
      setContributions(contributionsData.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${goal.name}"?`)) {
      return;
    }

    try {
      setError(null);
      await savingsGoalService.delete(goal.id);
      navigate('/savings-goals');
    } catch (err) {
      setError(err);
    }
  };

  const handleModalClose = async (refresh) => {
    setShowEditModal(false);
    setShowContributeModal(false);
    if (refresh) {
      await fetchGoalDetails();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Goal not found</h2>
        <button
          onClick={() => navigate('/savings-goals')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Savings Goals
        </button>
      </div>
    );
  }

  const percentage = goal.targetAmount > 0
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0;

  const remaining = goal.targetAmount - goal.currentAmount;

  const calculateMonthlyNeeded = () => {
    if (!goal.targetDate || goal.isCompleted) return 0;
    const today = new Date();
    const target = new Date(goal.targetDate);
    const monthsLeft = Math.max(
      (target.getFullYear() - today.getFullYear()) * 12 +
        (target.getMonth() - today.getMonth()),
      1
    );
    return remaining > 0 ? remaining / monthsLeft : 0;
  };

  const calculateProjectedDate = () => {
    if (goal.isCompleted) return null;
    if (contributions.length < 2) return null;

    const sortedContributions = [...contributions].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const firstContribution = sortedContributions[0];
    const lastContribution = sortedContributions[sortedContributions.length - 1];

    const daysBetween = Math.max(
      (new Date(lastContribution.createdAt) - new Date(firstContribution.createdAt)) /
        (1000 * 60 * 60 * 24),
      1
    );

    const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
    const averagePerDay = totalContributed / daysBetween;

    if (averagePerDay <= 0) return null;

    const daysToGoal = remaining / averagePerDay;
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysToGoal);

    return projectedDate;
  };

  const monthlyNeeded = calculateMonthlyNeeded();
  const projectedDate = calculateProjectedDate();

  const getProgressColor = (percent) => {
    if (percent >= 100) return '#10B981';
    if (percent >= 75) return '#3B82F6';
    if (percent >= 50) return '#F59E0B';
    if (percent >= 25) return '#F97316';
    return '#EF4444';
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/savings-goals')}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Savings Goals
        </button>

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div
              className="text-5xl p-4 rounded-lg"
              style={{ backgroundColor: `${goal.color || '#3B82F6'}20` }}
            >
              {goal.icon || '🎯'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {goal.name}
                {goal.isEmergencyFund && (
                  <span className="ml-3 inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800">
                    Emergency Fund
                  </span>
                )}
              </h1>
              {goal.description && (
                <p className="text-gray-600 mt-1">{goal.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowContributeModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Contribution
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      <ErrorAlert
        message={error?.message}
        errors={error?.errors}
        onClose={() => setError(null)}
      />

      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm text-gray-600">Current Progress</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(goal.currentAmount, goal.currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Target</p>
              <p className="text-2xl font-semibold text-gray-700">
                {formatCurrency(goal.targetAmount, goal.currency)}
              </p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden mb-2">
            <div
              className="h-full transition-all duration-500 flex items-center justify-center text-white text-sm font-medium"
              style={{
                width: `${percentage}%`,
                backgroundColor: getProgressColor(percentage),
              }}
            >
              {percentage > 10 && `${percentage.toFixed(1)}%`}
            </div>
          </div>

          {percentage <= 10 && (
            <p className="text-center text-lg font-bold" style={{ color: goal.color || '#3B82F6' }}>
              {percentage.toFixed(1)}%
            </p>
          )}
        </div>

        {goal.isCompleted && (
          <div className="mb-6 flex items-center gap-3 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-lg">Congratulations! Goal Completed!</p>
              <p className="text-sm">You have reached your savings target.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(Math.max(remaining, 0), goal.currency)}
            </p>
          </div>

          {goal.targetDate && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Target Date</p>
              <p className="text-xl font-bold text-gray-900">{formatDate(goal.targetDate)}</p>
            </div>
          )}

          {!goal.isCompleted && monthlyNeeded > 0 && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Monthly Needed</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(monthlyNeeded, goal.currency)}
              </p>
            </div>
          )}

          {!goal.isCompleted && projectedDate && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Projected Completion</p>
              <p className="text-xl font-bold text-gray-900">{formatDate(projectedDate)}</p>
              {goal.targetDate && projectedDate > new Date(goal.targetDate) && (
                <p className="text-xs text-red-600 mt-1">Behind target</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contributions History</h2>

        {contributions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No contributions yet</h3>
            <p className="text-gray-600 mb-6">Start contributing to your goal to track your progress.</p>
            <button
              onClick={() => setShowContributeModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md inline-flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Contribution
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contributions.map((contribution) => (
                  <tr key={contribution.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(contribution.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      +{formatCurrency(contribution.amount, goal.currency)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {contribution.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contribution.transactionId ? (
                        <span className="text-blue-600">Linked</span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Contributions</span>
                <span className="text-lg font-bold text-gray-900">
                  {contributions.length} contributions
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEditModal && (
        <GoalModal goal={goal} onClose={handleModalClose} />
      )}

      {showContributeModal && (
        <ContributeModal goal={goal} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default GoalDetails;
