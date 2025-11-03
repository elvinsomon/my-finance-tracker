const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 transition-colors"
        />
      </div>
      <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 transition-colors"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
