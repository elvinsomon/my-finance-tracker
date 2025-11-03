import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CurrencySelector = ({ value, onChange, name = 'currency' }) => {
  const currencies = [
    { code: 'DOP', name: 'Dominican Peso (RD$)' },
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
  ];

  const handleValueChange = (newValue) => {
    // Create synthetic event to match original onChange signature
    const syntheticEvent = {
      target: {
        name,
        value: newValue,
      },
    };
    onChange(syntheticEvent);
  };

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="flex h-10 w-full rounded-md border border-input bg-white/50 dark:bg-slate-800/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelector;
