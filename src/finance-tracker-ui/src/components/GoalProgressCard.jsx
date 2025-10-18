import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/formatters';

const GoalProgressCard = ({ goal, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const percentage = goal.targetAmount > 0
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0;

  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 75) return 'bg-blue-500';
    if (percent >= 50) return 'bg-yellow-500';
    if (percent >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPriorityStars = (priority) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`h-4 w-4 ${i <= priority ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on edit/delete buttons
    if (e.target.closest('button')) {
      return;
    }
    navigate(`/savings-goals/${goal.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
      style={{ borderLeft: `4px solid ${goal.color || '#3B82F6'}` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="text-3xl p-2 rounded-lg"
            style={{ backgroundColor: `${goal.color || '#3B82F6'}20` }}
          >
            {goal.icon || '🎯'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {goal.name}
              {goal.isEmergencyFund && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Emergency
                </span>
              )}
            </h3>
            {goal.description && (
              <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(goal);
            }}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Edit goal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(goal);
            }}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete goal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-600">Current / Target</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(goal.currentAmount, goal.currency)} / {formatCurrency(goal.targetAmount, goal.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: goal.color || '#3B82F6' }}>
              {percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">completed</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-1">
            {getPriorityStars(goal.priority || 1)}
          </div>
          {goal.targetDate && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Target:</span> {formatDate(goal.targetDate)}
            </div>
          )}
        </div>

        {goal.isCompleted && (
          <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-md">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Goal Completed!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalProgressCard;
