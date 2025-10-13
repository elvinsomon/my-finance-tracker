# API Integration Documentation - MyFinanceTracker

Complete guide to how the frontend integrates with the backend API.

---

## Overview

The frontend uses **Axios** as the HTTP client with a centralized configuration and service layer pattern.

**Base Configuration**:
- Base URL: `http://localhost:5000/api` (configurable via `.env`)
- Content-Type: `application/json`
- Authentication: Bearer Token (JWT)

---

## Axios Instance Configuration

### File: `/src/services/api.js`

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## Request Interceptor

**Purpose**: Automatically inject JWT token into all requests

```javascript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**How it works**:
1. Before each request, check localStorage for token
2. If token exists, add to Authorization header
3. Format: `Authorization: Bearer {token}`

---

## Response Interceptor

**Purpose**: Handle common errors globally

```javascript
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - logout user
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Return formatted error
      return Promise.reject({
        statusCode: error.response.status,
        message: error.response.data?.message || 'An error occurred',
        errors: error.response.data?.errors || [],
      });
    } else if (error.request) {
      // Network error
      return Promise.reject({
        statusCode: 0,
        message: 'Network error. Please check your connection.',
        errors: [],
      });
    } else {
      // Other errors
      return Promise.reject({
        statusCode: 0,
        message: error.message || 'An unexpected error occurred',
        errors: [],
      });
    }
  }
);
```

**Error Handling**:
- **401 Unauthorized**: Auto-logout and redirect to login
- **Network Errors**: Friendly message about connection
- **Other Errors**: Generic error message
- **Structured Response**: Always returns `{ statusCode, message, errors }`

---

## Service Layer

All API calls are organized into service modules:

### Authentication Service

**File**: `/src/services/authService.js`

```javascript
const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email, password, fullName, defaultCurrency) {
    const response = await api.post('/auth/register', {
      email, password, fullName, defaultCurrency
    });
    return response.data;
  },
};
```

**Returns**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "guid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "defaultCurrency": "DOP"
  },
  "expiresAt": "2025-10-13T20:00:00Z"
}
```

---

### Transaction Service

**File**: `/src/services/transactionService.js`

**Methods**:

#### `getAll(filters)`
```javascript
await transactionService.getAll({
  page: 1,
  pageSize: 20,
  startDate: '2025-10-01',
  endDate: '2025-10-31',
  type: 'Expense',
  categoryId: 'guid',
  accountId: 'guid'
});
```

**Returns**:
```json
{
  "data": [...],
  "page": 1,
  "pageSize": 20,
  "totalCount": 45,
  "totalPages": 3
}
```

#### `getById(id)`
```javascript
await transactionService.getById('transaction-guid');
```

#### `create(data)`
```javascript
await transactionService.create({
  accountId: 'guid',
  categoryId: 'guid',
  type: 'Expense',
  amount: 1500.00,
  currency: 'DOP',
  date: '2025-10-12',
  description: 'Supermercado',
  paymentMethod: 'Tarjeta de Crédito',
  merchant: 'La Sirena',
  notes: 'Compra semanal'
});
```

#### `update(id, data)`
```javascript
await transactionService.update('guid', {
  amount: 1600.00,
  description: 'Supermercado - actualizado'
});
```

#### `delete(id)`
```javascript
await transactionService.delete('guid');
```

#### `exportCSV(filters)`
```javascript
await transactionService.exportCSV({
  startDate: '2025-10-01',
  endDate: '2025-10-31'
});
// Automatically triggers download
```

---

### Category Service

**File**: `/src/services/categoryService.js`

```javascript
// Get all categories
await categoryService.getAll();

// Get filtered categories
await categoryService.getAll('Expense', false);

// Create category
await categoryService.create({
  name: 'Gimnasio',
  type: 'Expense',
  icon: '💪',
  color: '#8b5cf6'
});
```

---

### Budget Service

**File**: `/src/services/budgetService.js`

```javascript
// Get all budgets
await budgetService.getAll();

// Get active budgets only
await budgetService.getAll({ isActive: true });

// Create budget
await budgetService.create({
  categoryId: 'guid',
  period: 'Monthly',
  amount: 15000.00,
  currency: 'DOP',
  startDate: '2025-10-01',
  endDate: '2025-10-31',
  alertThreshold80: true,
  alertThreshold100: true
});
```

---

### Account Service

**File**: `/src/services/accountService.js`

```javascript
// Get all accounts
await accountService.getAll();

// Create account
await accountService.create({
  name: 'Cuenta Corriente',
  type: 'Bank',
  currency: 'DOP',
  initialBalance: 50000.00,
  institution: 'Banco Popular',
  accountNumber: '****1234'
});
```

---

### Dashboard Service

**File**: `/src/services/dashboardService.js`

```javascript
// Get dashboard summary
const summary = await dashboardService.getSummary();

// Returns aggregated data:
{
  accounts: [...],
  budgets: [...],
  recentTransactions: [...]
}
```

**Note**: This aggregates multiple API calls since there's no single dashboard endpoint.

---

## Error Handling Pattern

### In Components

```javascript
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await transactionService.getAll();
    setTransactions(data.data);
  } catch (err) {
    setError(err); // err has { statusCode, message, errors }
  } finally {
    setLoading(false);
  }
};
```

### Displaying Errors

```jsx
<ErrorAlert
  message={error?.message}
  errors={error?.errors}
  onClose={() => setError(null)}
/>
```

---

## Loading States

### Pattern

```javascript
const [loading, setLoading] = useState(true);

// Show spinner while loading
if (loading) {
  return <LoadingSpinner size="lg" />;
}

// Show content when loaded
return <div>{content}</div>;
```

### Button Loading State

```jsx
<button type="submit" disabled={loading}>
  {loading ? <LoadingSpinner size="sm" /> : 'Submit'}
</button>
```

---

## Authentication Flow

### Login Process

1. User submits credentials
2. Call `authService.login(email, password)`
3. Receive token and user data
4. Store in localStorage and AuthContext
5. Redirect to dashboard

```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await authService.login(email, password);
    login(response.token, response.user); // Updates context and localStorage
    navigate('/');
  } catch (err) {
    setError(err);
  }
};
```

### Token Storage

**localStorage Keys**:
- `token`: JWT token string
- `user`: JSON stringified user object

```javascript
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
```

### Token Injection

Automatic via request interceptor - no manual work needed:

```javascript
// This happens automatically:
api.get('/transactions')
// → Headers: { Authorization: 'Bearer {token}' }
```

### Token Expiration

**Handled by backend**:
- Backend returns 401 when token expired
- Response interceptor catches 401
- Automatically logs out user
- Redirects to login page

---

## Data Formatting

### Date Formatting

API sends dates in ISO 8601 format: `2025-10-12T18:00:00Z`

Frontend formats for display:

```javascript
import { formatDate } from '../utils/formatters';

formatDate('2025-10-12T18:00:00Z'); // "Oct 12, 2025"
```

### Currency Formatting

```javascript
import { formatCurrency } from '../utils/formatters';

formatCurrency(1500.50, 'DOP'); // "RD$1,500.50"
formatCurrency(100.00, 'USD');  // "$100.00"
```

---

## Request/Response Examples

### Create Transaction

**Request**:
```http
POST /api/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categoryId": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
  "type": "Expense",
  "amount": 1500.00,
  "currency": "DOP",
  "date": "2025-10-12",
  "description": "Supermercado",
  "paymentMethod": "Tarjeta de Crédito",
  "merchant": "La Sirena"
}
```

**Response** (201 Created):
```json
{
  "id": "5fa85f64-5717-4562-b3fc-2c963f66afa6",
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "accountName": "Cuenta Corriente",
  "categoryId": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categoryName": "Alimentación",
  "type": "Expense",
  "amount": 1500.00,
  "currency": "DOP",
  "exchangeRate": 1.0,
  "amountInBaseCurrency": 1500.00,
  "date": "2025-10-12",
  "description": "Supermercado",
  "paymentMethod": "Tarjeta de Crédito",
  "merchant": "La Sirena",
  "status": "Completed",
  "createdAt": "2025-10-12T18:00:00Z"
}
```

---

## CORS Configuration

Backend must allow:
- Origin: `http://localhost:5173` (Vite dev server)
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Authorization, Content-Type
- Credentials: true

---

## Environment Variables

**File**: `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

**Usage**:
```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

**Important**:
- Vite requires `VITE_` prefix
- Restart dev server after changing .env

---

## Best Practices

### 1. Always Use Service Layer
```javascript
// ✅ Good
import transactionService from '../services/transactionService';
await transactionService.getAll();

// ❌ Bad
import api from '../services/api';
await api.get('/transactions');
```

### 2. Handle All Error Cases
```javascript
try {
  await service.action();
} catch (err) {
  setError(err); // Show to user
  console.error('Detailed error:', err); // Log for debugging
}
```

### 3. Provide Loading Feedback
```javascript
setLoading(true);
try {
  await service.action();
} finally {
  setLoading(false); // Always run
}
```

### 4. Clear Errors on Retry
```javascript
const retry = async () => {
  setError(null); // Clear previous error
  await fetchData();
};
```

### 5. Use Async/Await
```javascript
// ✅ Good
const data = await service.get();

// ❌ Bad (harder to read)
service.get().then(data => { ... });
```

---

## Common Issues and Solutions

### Issue: 401 Unauthorized
**Cause**: Invalid or expired token
**Solution**: Automatic logout and redirect to login

### Issue: Network Error
**Cause**: Backend not running or wrong URL
**Solution**: Check backend is running on correct port

### Issue: CORS Error
**Cause**: Backend not configured for frontend origin
**Solution**: Configure CORS in backend to allow `http://localhost:5173`

### Issue: Token Not Sent
**Cause**: Token not in localStorage
**Solution**: Ensure login stores token before making requests

---

## Testing API Integration

### Manual Testing

1. Start backend: `cd backend && dotnet run`
2. Start frontend: `cd src/finance-tracker-ui && npm run dev`
3. Test flow:
   - Register new user
   - Login
   - Create account
   - Create transaction
   - View dashboard
   - Logout

### Network Tab Inspection

Check browser DevTools → Network tab:
- Verify Authorization header present
- Check request/response payloads
- Monitor status codes
- Inspect error responses
