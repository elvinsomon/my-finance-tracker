# Routing Documentation - MyFinanceTracker

Complete routing structure and navigation flow.

---

## Routing Configuration

The application uses **React Router v6** with the following structure:

```jsx
<BrowserRouter>
  <AuthProvider>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/export" element={<Export />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

---

## Route Definitions

### Public Routes

#### `/login`
- **Component**: `Login`
- **Purpose**: User authentication
- **Access**: Public (redirects to dashboard if already authenticated)
- **Features**:
  - Email and password input
  - Form validation
  - Error display
  - Link to registration

#### `/register`
- **Component**: `Register`
- **Purpose**: New user registration
- **Access**: Public
- **Features**:
  - Full name, email, password, currency selection
  - Form validation
  - Error display
  - Link to login

---

### Protected Routes

All routes wrapped in `ProtectedRoute` component which:
- Checks authentication status
- Redirects to `/login` if not authenticated
- Shows loading spinner during auth check
- Includes Navbar for navigation

#### `/` (Dashboard)
- **Component**: `Dashboard`
- **Purpose**: Main overview page
- **Features**:
  - Total balance summary
  - Income vs Expense chart
  - Recent transactions
  - Budget progress
  - Quick navigation links

#### `/transactions`
- **Component**: `Transactions`
- **Purpose**: View and manage all transactions
- **Features**:
  - Paginated transaction list
  - Advanced filters
  - Create transaction (modal)
  - Edit transaction (modal)
  - Delete transaction
  - Transaction cards with details

#### `/categories`
- **Component**: `Categories`
- **Purpose**: View and create categories
- **Features**:
  - Income categories section
  - Expense categories section
  - Category hierarchy display
  - Create category (modal)
  - Icon and color customization

#### `/budgets`
- **Component**: `Budgets`
- **Purpose**: Manage budget limits
- **Features**:
  - Budget cards with progress bars
  - Visual alerts (80%, 100%)
  - Create budget (modal)
  - Period selection
  - Category-specific budgets

#### `/accounts`
- **Component**: `Accounts`
- **Purpose**: Manage financial accounts
- **Features**:
  - Account cards
  - Balance display
  - Multiple account types
  - Create account (modal)
  - Institution details

#### `/export`
- **Component**: `Export`
- **Purpose**: Export transactions to CSV
- **Features**:
  - Filter selection
  - CSV download
  - Export tips
  - Format information

---

## Navigation Flow

### User Journey

```
1. First Visit
   ├─→ /login (not authenticated)
   └─→ Enter credentials → / (Dashboard)

2. Registration Flow
   ├─→ /register
   └─→ Complete form → / (Dashboard)

3. Authenticated Navigation
   ├─→ / (Dashboard) - Overview
   ├─→ /transactions - Manage transactions
   ├─→ /categories - Organize categories
   ├─→ /budgets - Set spending limits
   ├─→ /accounts - Manage accounts
   └─→ /export - Download data

4. Logout
   └─→ Any route → /login
```

### Route Protection

**ProtectedRoute Component Logic**:
```jsx
if (loading) return <LoadingSpinner />;
if (!isAuthenticated) return <Navigate to="/login" />;
return (
  <>
    <Navbar />
    <main>
      <Outlet /> {/* Renders child routes */}
    </main>
  </>
);
```

---

## Navigation Components

### Navbar Links

Desktop and mobile navigation includes:

```jsx
const navLinks = [
  { path: '/', label: 'Dashboard' },
  { path: '/transactions', label: 'Transactions' },
  { path: '/categories', label: 'Categories' },
  { path: '/budgets', label: 'Budgets' },
  { path: '/accounts', label: 'Accounts' },
  { path: '/export', label: 'Export' },
];
```

**Active Route Highlighting**:
- Current route is highlighted with different colors
- Uses `useLocation()` hook to determine active route

---

## Programmatic Navigation

### Using useNavigate Hook

```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate to dashboard
navigate('/');

// Navigate with replace (no history entry)
navigate('/login', { replace: true });

// Navigate back
navigate(-1);
```

### Common Navigation Patterns

**After Successful Action**:
```jsx
const handleCreateTransaction = async () => {
  await transactionService.create(data);
  navigate('/transactions'); // Redirect to list
};
```

**After Authentication**:
```jsx
const handleLogin = async () => {
  await authService.login(email, password);
  navigate('/'); // Redirect to dashboard
};
```

**After Logout**:
```jsx
const handleLogout = () => {
  logout(); // Clear auth state
  navigate('/login'); // Redirect to login
};
```

---

## URL Parameters and Query Strings

### Current Implementation
- No URL parameters used for CRUD operations
- Filters use component state (not URL query params)

### Future Enhancements
Consider adding query parameters for:
- Transaction filters: `/transactions?type=expense&category=food`
- Date ranges: `/transactions?start=2025-10-01&end=2025-10-31`
- Pagination: `/transactions?page=2`
- Search: `/transactions?search=grocery`

**Benefits**:
- Shareable URLs
- Browser back/forward support
- Deep linking

---

## Route Guards Summary

| Route | Protected | Requires | Redirects |
|-------|-----------|----------|-----------|
| `/login` | No | None | Dashboard if authenticated |
| `/register` | No | None | Dashboard if authenticated |
| `/` | Yes | JWT Token | `/login` if not authenticated |
| `/transactions` | Yes | JWT Token | `/login` if not authenticated |
| `/categories` | Yes | JWT Token | `/login` if not authenticated |
| `/budgets` | Yes | JWT Token | `/login` if not authenticated |
| `/accounts` | Yes | JWT Token | `/login` if not authenticated |
| `/export` | Yes | JWT Token | `/login` if not authenticated |
| `/*` (404) | No | None | Redirects to `/` |

---

## Error Handling

### 401 Unauthorized
- Intercepted in Axios response interceptor
- Automatically clears auth state
- Redirects to `/login`
- Shows error message

### 404 Not Found
- Catch-all route redirects to dashboard
- No dedicated 404 page in MVP

### Network Errors
- Handled by API service layer
- Error alert displayed on current page
- No route change

---

## Mobile Navigation

### Responsive Behavior

**Desktop (≥ 640px)**:
- Horizontal navigation bar
- All links visible
- User info in header
- Logout button in header

**Mobile (< 640px)**:
- Hamburger menu icon
- Slide-out navigation menu
- Vertical link list
- User info in menu
- Logout button in menu

---

## Best Practices

1. **Use Link for Internal Navigation**
   ```jsx
   <Link to="/transactions">View Transactions</Link>
   ```

2. **Use navigate() for Programmatic Navigation**
   ```jsx
   navigate('/dashboard');
   ```

3. **Always Protect Sensitive Routes**
   - Wrap in ProtectedRoute
   - Verify authentication on backend

4. **Handle Loading States**
   - Show spinner during route transitions
   - Prevent flickering

5. **Provide Visual Feedback**
   - Highlight active routes
   - Show loading indicators
   - Display error messages

---

## Future Routing Enhancements

### Potential Additions
1. **Dynamic Routes**
   - `/transactions/:id` for transaction details
   - `/accounts/:id` for account details

2. **Modal Routes**
   - `/transactions/new` opens modal
   - `/transactions/:id/edit` opens edit modal
   - Maintains background route

3. **Tab Navigation**
   - `/reports/monthly` vs `/reports/yearly`
   - Nested routes with tabs

4. **Breadcrumbs**
   - Show navigation path
   - Easy navigation back

5. **Route Transitions**
   - Smooth animations between routes
   - Loading indicators
