# MyFinanceTracker - Frontend

Complete React + Vite frontend for Phase 1 MVP of MyFinanceTracker personal finance management application.

## Features

### Authentication
- User registration with email, password, full name, and default currency
- Secure login with JWT token
- Persistent sessions using localStorage
- Automatic logout on token expiration

### Dashboard
- Total balance summary across all accounts
- Income vs Expense bar chart for current month
- Recent transactions (last 10)
- Budget progress visualization
- Quick access to all features

### Transactions Management
- Create, read, update, delete transactions
- Advanced filtering by date range, type, category, account
- Pagination (20 per page)
- Multi-currency support (DOP, USD, EUR)
- Transaction types: Income, Expense, Transfer
- Detailed transaction information

### Categories
- View all income and expense categories
- Create custom categories with icons and colors
- Subcategory support
- System vs user categories

### Budgets
- Create monthly, yearly, or custom period budgets
- Visual progress bars with color-coded warnings
- Automatic spent calculation
- Alert thresholds (80%, 100%)
- Category-specific budgets

### Accounts
- Multiple account types (Bank, Credit Card, Cash, Digital Wallet)
- Current balance tracking
- Multi-currency accounts
- Institution and account number details

### Export
- CSV export with customizable filters
- Date range selection
- Category and account filtering
- Automatic file download

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS v4** - Utility-first styling
- **Chart.js + react-chartjs-2** - Data visualization
- **date-fns** - Date formatting

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BudgetProgressBar.jsx
│   ├── CategoryBadge.jsx
│   ├── CurrencySelector.jsx
│   ├── DateRangePicker.jsx
│   ├── ErrorAlert.jsx
│   ├── LoadingSpinner.jsx
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── TransactionCard.jsx
│   └── TransactionModal.jsx
├── pages/              # Page components
│   ├── Accounts.jsx
│   ├── Budgets.jsx
│   ├── Categories.jsx
│   ├── Dashboard.jsx
│   ├── Export.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Transactions.jsx
├── services/           # API integration
│   ├── accountService.js
│   ├── api.js
│   ├── authService.js
│   ├── budgetService.js
│   ├── categoryService.js
│   ├── dashboardService.js
│   └── transactionService.js
├── context/           # React context
│   └── AuthContext.jsx
├── hooks/             # Custom hooks
│   └── useAuth.js
├── utils/             # Utility functions
│   └── formatters.js
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:5000

### Installation

1. Navigate to the project directory:
```bash
cd src/finance-tracker-ui
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already created):
```env
VITE_API_URL=http://localhost:5000/api
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build

Create production build:
```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

**Note**: All Vite environment variables must be prefixed with `VITE_`

## API Integration

The frontend consumes the backend REST API with the following features:

### Authentication
- JWT token stored in localStorage
- Automatic token injection in request headers
- Auto-logout on 401 errors

### Error Handling
- Global error interceptor
- User-friendly error messages
- Network error detection

### Service Layer
All API calls go through service modules:
- `authService` - Login, register
- `transactionService` - CRUD transactions, export CSV
- `categoryService` - Get and create categories
- `budgetService` - Get and create budgets
- `accountService` - Get and create accounts
- `dashboardService` - Aggregated dashboard data

## Styling

### Tailwind CSS

The app uses Tailwind CSS v4 with a custom configuration:

**Color Palette**:
- **Income**: Green tones (`income-50` to `income-900`)
- **Expense**: Red tones (`expense-50` to `expense-900`)
- **Primary**: Blue tones (`primary-50` to `primary-900`)

**Responsive Breakpoints**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Components
All components follow a consistent design system with:
- Cards: White background, rounded corners, shadow
- Buttons: Primary (blue), Secondary (gray), Destructive (red)
- Forms: Consistent input styling, validation feedback
- Mobile-first responsive design

## Routing

### Public Routes
- `/login` - User login
- `/register` - New user registration

### Protected Routes
All require authentication:
- `/` - Dashboard (main page)
- `/transactions` - Transactions management
- `/categories` - Categories management
- `/budgets` - Budget management
- `/accounts` - Account management
- `/export` - CSV export

### Route Protection
Protected routes use the `ProtectedRoute` component which:
- Checks authentication status
- Redirects to `/login` if not authenticated
- Shows loading spinner during auth check

## Testing with Backend

1. Start the backend API:
```bash
cd ../../backend
dotnet run
```

2. Start the frontend (in another terminal):
```bash
cd src/finance-tracker-ui
npm run dev
```

3. Test the complete flow:
   - Register a new user at http://localhost:5173/register
   - Login with credentials
   - Create an account
   - Create a transaction
   - View dashboard
   - Test all features

## Documentation

Comprehensive documentation is available in `/docs/frontend/`:

- **implementation-log.md** - Complete implementation timeline and decisions
- **component-library.md** - All reusable components with usage examples
- **routing.md** - Routing structure and navigation flow
- **api-integration.md** - API integration patterns and error handling
- **ui-decisions.md** - UI/UX design decisions and rationale

## Key Features Implemented

### Phase 1 MVP Complete
- User authentication with JWT
- Dashboard with summary and charts
- Full CRUD for transactions
- Advanced transaction filtering
- Pagination
- Multi-currency support
- Category management
- Budget tracking with visual alerts
- Account management
- CSV export
- Responsive mobile design
- Error handling and validation
- Loading states

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Modern browsers with ES6+ support required.

## Performance

### Production Build
- Bundle size: 502 KB
- Gzipped: 159 KB
- Build time: ~1.2s

### Optimization Opportunities
- Code splitting for routes
- Lazy loading images
- Memoization of expensive calculations

## Known Issues

None at this time. All Phase 1 features are working as expected.

## Future Enhancements (Phase 2+)

- Transaction search
- Advanced analytics and reports
- Dark mode
- Offline support
- Mobile app version
- Real-time updates with WebSockets
- File upload for receipts
- Recurring transactions
- Budget templates

## Contributing

When adding new features:
1. Follow existing code patterns
2. Use Tailwind CSS for styling
3. Create reusable components
4. Add error handling
5. Test on mobile devices
6. Update documentation

## License

This project is part of MyFinanceTracker personal finance management system.

## Contact

For questions or issues, please refer to the main project documentation.

---

**Built with React + Vite + Tailwind CSS**
