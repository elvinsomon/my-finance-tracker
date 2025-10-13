# Component Library - MyFinanceTracker

Complete reference for all reusable components in the application.

---

## Core Components

### LoadingSpinner

**Purpose**: Display loading indicator during async operations

**Props**:
- `size` (string, optional): Size of spinner - 'sm', 'md', 'lg'. Default: 'md'

**Usage**:
```jsx
import LoadingSpinner from '../components/LoadingSpinner';

<LoadingSpinner size="lg" />
```

---

### ErrorAlert

**Purpose**: Display error messages with optional list of specific errors

**Props**:
- `message` (string, required): Main error message
- `errors` (array, optional): Array of specific error strings
- `onClose` (function, optional): Callback when close button clicked

**Usage**:
```jsx
import ErrorAlert from '../components/ErrorAlert';

<ErrorAlert
  message="Failed to load data"
  errors={['Network error', 'Connection timeout']}
  onClose={() => setError(null)}
/>
```

---

## Navigation Components

### Navbar

**Purpose**: Main navigation bar with responsive mobile menu

**Props**: None (uses useAuth hook internally)

**Features**:
- Desktop horizontal navigation
- Mobile hamburger menu
- User info display
- Logout button
- Active route highlighting

**Usage**:
```jsx
import Navbar from '../components/Navbar';

<Navbar />
```

---

### ProtectedRoute

**Purpose**: Wrapper component for protected routes requiring authentication

**Props**: None (uses Outlet for nested routes)

**Features**:
- Checks authentication status
- Redirects to login if not authenticated
- Shows loading spinner during auth check
- Includes Navbar for authenticated views

**Usage**:
```jsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Dashboard />} />
  <Route path="/transactions" element={<Transactions />} />
</Route>
```

---

## Transaction Components

### TransactionCard

**Purpose**: Display transaction information in card format

**Props**:
- `transaction` (object, required): Transaction data
  - `id`, `type`, `amount`, `currency`, `date`, `description`, `categoryName`, `accountName`
- `onEdit` (function, optional): Callback for edit button
- `onDelete` (function, optional): Callback for delete button

**Features**:
- Color-coded by type (green for income, red for expense)
- Formatted currency and date
- Category and account icons
- Edit/Delete actions

**Usage**:
```jsx
import TransactionCard from '../components/TransactionCard';

<TransactionCard
  transaction={transaction}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

### TransactionModal

**Purpose**: Modal form for creating or editing transactions

**Props**:
- `transaction` (object, optional): Transaction to edit (null for create)
- `categories` (array, required): Available categories
- `accounts` (array, required): Available accounts
- `onClose` (function, required): Callback with boolean indicating if refresh needed

**Features**:
- Full transaction form
- Validation
- Currency selector
- Date picker
- Type dropdown

**Usage**:
```jsx
import TransactionModal from '../components/TransactionModal';

<TransactionModal
  transaction={selectedTransaction}
  categories={categories}
  accounts={accounts}
  onClose={(shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) fetchData();
  }}
/>
```

---

## Category Components

### CategoryBadge

**Purpose**: Display category with icon and color

**Props**:
- `category` (object, required): Category data
  - `name`, `icon`, `color`

**Usage**:
```jsx
import CategoryBadge from '../components/CategoryBadge';

<CategoryBadge category={category} />
```

---

## Budget Components

### BudgetProgressBar

**Purpose**: Visual progress bar for budget tracking

**Props**:
- `budgeted` (number, required): Total budget amount
- `spent` (number, required): Amount spent
- `currency` (string, required): Currency code
- `categoryName` (string, required): Category name

**Features**:
- Color-coded progress (green < 80%, yellow 80-99%, red >= 100%)
- Percentage display
- Remaining amount calculation
- Warning messages

**Usage**:
```jsx
import BudgetProgressBar from '../components/BudgetProgressBar';

<BudgetProgressBar
  budgeted={15000}
  spent={8500}
  currency="DOP"
  categoryName="Food"
/>
```

---

## Form Components

### CurrencySelector

**Purpose**: Dropdown for selecting currency

**Props**:
- `value` (string, required): Current currency value
- `onChange` (function, required): Change handler
- `name` (string, optional): Input name. Default: 'currency'

**Features**:
- DOP, USD, EUR options
- Shows currency symbol and name

**Usage**:
```jsx
import CurrencySelector from '../components/CurrencySelector';

<CurrencySelector
  value={formData.currency}
  onChange={handleChange}
  name="currency"
/>
```

---

### DateRangePicker

**Purpose**: Start and end date inputs

**Props**:
- `startDate` (string, required): Start date value (YYYY-MM-DD)
- `endDate` (string, required): End date value (YYYY-MM-DD)
- `onStartDateChange` (function, required): Start date change handler
- `onEndDateChange` (function, required): End date change handler

**Usage**:
```jsx
import DateRangePicker from '../components/DateRangePicker';

<DateRangePicker
  startDate={filters.startDate}
  endDate={filters.endDate}
  onStartDateChange={(value) => setFilters({...filters, startDate: value})}
  onEndDateChange={(value) => setFilters({...filters, endDate: value})}
/>
```

---

## Component Styling Guidelines

All components use Tailwind CSS utility classes with the following conventions:

### Color Palette
- **Income**: `income-{shade}` (green tones)
- **Expense**: `expense-{shade}` (red tones)
- **Primary**: `primary-{shade}` (blue tones)
- **Neutral**: `gray-{shade}`

### Common Classes
- **Cards**: `bg-white rounded-lg shadow p-6`
- **Buttons Primary**: `bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md`
- **Buttons Secondary**: `border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md`
- **Inputs**: `border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500`

### Responsive Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## Creating New Components

When creating new components, follow these guidelines:

1. **File Naming**: PascalCase (e.g., `MyComponent.jsx`)
2. **Props Destructuring**: Use destructuring in function signature
3. **PropTypes**: Not used (consider TypeScript for future)
4. **Styling**: Use Tailwind utility classes
5. **Accessibility**: Include ARIA labels where appropriate
6. **Responsive**: Mobile-first design
7. **Error Handling**: Handle edge cases gracefully

**Example Template**:
```jsx
const MyComponent = ({ prop1, prop2, onAction }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Component content */}
    </div>
  );
};

export default MyComponent;
```
