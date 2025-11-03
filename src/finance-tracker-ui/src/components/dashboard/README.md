# Dashboard Components

This directory contains specialized chart components for the Dashboard using Recharts library.

## Components

### IncomeExpenseChart

A bar chart component that displays income vs expenses comparison for the current month.

**Props:**
- `income` (number): Total income amount
- `expense` (number): Total expense amount
- `currency` (string, default: 'USD'): Currency code for formatting
- `loading` (boolean, default: false): Shows loading skeleton when true

**Features:**
- Glassmorphism styled tooltip
- Responsive container (adapts to parent width)
- Custom legend with color indicators
- Rounded bar corners for modern look
- Dark mode support
- Smooth animations with staggered bar entrance
- Compact currency formatting for Y-axis
- Loading skeleton state

**Usage:**
```jsx
import IncomeExpenseChart from './components/dashboard/IncomeExpenseChart';

<IncomeExpenseChart
  income={5000}
  expense={3000}
  currency="USD"
  loading={false}
/>
```

### MonthlyTrendChart

An area chart component that displays income and expense trends over multiple months.

**Props:**
- `data` (array): Array of objects with month, Income, and Expense values
- `currency` (string, default: 'USD'): Currency code for formatting
- `loading` (boolean, default: false): Shows loading skeleton when true

**Data Format:**
```js
const data = [
  { month: 'Jan', Income: 5000, Expense: 3000 },
  { month: 'Feb', Income: 6000, Expense: 3500 },
  // ...
];
```

**Features:**
- Gradient fill for visual appeal
- Smooth curve interpolation
- Glassmorphism styled tooltip
- Responsive container
- Dark mode support
- Empty state handling
- Loading skeleton state

**Usage:**
```jsx
import MonthlyTrendChart from './components/dashboard/MonthlyTrendChart';

<MonthlyTrendChart
  data={monthlyData}
  currency="USD"
  loading={false}
/>
```

## Styling

All components follow the glassmorphism design pattern with:
- Semi-transparent backgrounds with backdrop blur
- Subtle borders with low opacity
- Glass shadow effects
- Smooth transitions
- Full dark mode support

## Dependencies

- `recharts` (v3.3.0+): Modern charting library
- `../../utils/formatters`: Currency formatting utilities

## Migration from Chart.js

These components replace the previous Chart.js implementation in the Dashboard. Benefits include:

1. **Better React Integration**: Recharts is built specifically for React with proper component composition
2. **Smaller Bundle Size**: More lightweight than Chart.js
3. **Better Customization**: Easier to customize tooltips, legends, and chart elements
4. **Responsive by Default**: ResponsiveContainer handles all sizing automatically
5. **Modern API**: More intuitive props-based configuration
6. **Better TypeScript Support**: Full TypeScript definitions included

## Performance

- Charts use memoization to prevent unnecessary re-renders
- Animations are GPU-accelerated
- Responsive containers avoid layout thrashing
- Loading states prevent layout shifts

## Browser Support

Supports all modern browsers that support:
- ES6+ JavaScript
- SVG rendering
- CSS backdrop-filter (with graceful degradation)

---

## Stat Cards

### StatCard

A modern stat card component with glassmorphism effect, gradient icons, and optional trend indicators.

**Props:**
- `title` (string): Card title (e.g., "Total Balance")
- `value` (number): Numeric value to display
- `currency` (string, default: 'DOP'): Currency code
- `icon` (LucideIcon): Lucide React icon component
- `trend` (object, optional): Trend indicator
  - `value` (number): Percentage change (e.g., 12.5 for +12.5%)
  - `isPositive` (boolean): true for positive (green), false for negative (red)
- `iconColor` (string, default: 'from-blue-500 to-blue-600'): Tailwind gradient classes
- `isLoading` (boolean, default: false): Show loading skeleton

**Features:**
- Glassmorphism with backdrop blur
- Gradient icon backgrounds
- Trend indicators with arrows
- Hover lift animation
- Icon rotation on hover
- Loading skeleton states
- Gradient bottom accent
- Dark mode support
- Responsive sizing

**Usage:**
```jsx
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import StatCard from './components/dashboard/StatCard';

// Simple card
<StatCard
  title="Total Balance"
  value={15420.50}
  currency="USD"
  icon={Wallet}
  iconColor="from-blue-500 to-blue-600"
/>

// With positive trend
<StatCard
  title="Income This Month"
  value={5420.00}
  currency="USD"
  icon={TrendingUp}
  iconColor="from-emerald-500 to-emerald-600"
  trend={{ value: 12.5, isPositive: true }}
/>

// With negative trend
<StatCard
  title="Expenses This Month"
  value={3200.00}
  currency="USD"
  icon={TrendingDown}
  iconColor="from-rose-500 to-rose-600"
  trend={{ value: 8.3, isPositive: false }}
/>
```

**Available Gradient Colors:**
```jsx
// Blue (balance/total)
iconColor="from-blue-500 to-blue-600"

// Green (income/positive)
iconColor="from-emerald-500 to-emerald-600"

// Red (expenses/negative)
iconColor="from-rose-500 to-rose-600"

// Purple (savings/goals)
iconColor="from-purple-500 to-purple-600"

// Orange (warnings)
iconColor="from-orange-500 to-orange-600"

// Indigo (reports)
iconColor="from-indigo-500 to-indigo-600"
```

### StatsGrid

A responsive grid container for stat cards with staggered entrance animations.

**Props:**
- `children` (ReactNode): StatCard components
- `isLoading` (boolean, optional): Loading state

**Features:**
- Staggered animation (0.1s delay)
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
- Smooth entrance animations

**Usage:**
```jsx
import StatsGrid from './components/dashboard/StatsGrid';
import StatCard from './components/dashboard/StatCard';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

<StatsGrid>
  <StatCard title="..." value={...} icon={Wallet} />
  <StatCard title="..." value={...} icon={TrendingUp} />
  <StatCard title="..." value={...} icon={TrendingDown} />
</StatsGrid>
```

### Calculating Trends

To display trends, calculate percentage change between periods:

```jsx
const calculateTrend = (currentValue, previousValue) => {
  if (previousValue === 0) return null;

  const percentChange = ((currentValue - previousValue) / previousValue) * 100;

  return {
    value: Math.abs(percentChange),
    isPositive: percentChange >= 0
  };
};

// Example
const trend = calculateTrend(5420.00, 4820.00);
// Returns: { value: 12.45, isPositive: true }
```
