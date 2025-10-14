const CurrencySelector = ({ value, onChange, name = 'currency' }) => {
  const currencies = [
    { code: 'DOP', name: 'Dominican Peso (RD$)' },
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
  ];

  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 py-2 px-3 border"
    >
      <option value="">Select currency</option>
      {currencies.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.name}
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;
