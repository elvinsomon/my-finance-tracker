import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './lib/theme-provider';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Accounts from './pages/Accounts';
import Export from './pages/Export';
import Reports from './pages/Reports';
import SavingsGoals from './pages/SavingsGoals';
import GoalDetails from './pages/GoalDetails';
import Import from './pages/Import';
import CategoryRules from './pages/CategoryRules';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/savings-goals" element={<SavingsGoals />} />
              <Route path="/savings-goals/:id" element={<GoalDetails />} />
              <Route path="/import" element={<Import />} />
              <Route path="/category-rules" element={<CategoryRules />} />
              <Route path="/export" element={<Export />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
