import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import accountService from '../services/accountService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import CurrencySelector from '../components/CurrencySelector';
import AccountCard from '../components/accounts/AccountCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const Accounts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Bank',
    currency: 'DOP',
    initialBalance: '',
    institution: '',
    accountNumber: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        initialBalance: parseFloat(formData.initialBalance),
      };
      await accountService.create(payload);
      setIsModalOpen(false);
      setFormData({
        name: '',
        type: 'Bank',
        currency: 'DOP',
        initialBalance: '',
        institution: '',
        accountNumber: '',
      });
      fetchAccounts();
    } catch (err) {
      setError(err);
    } finally {
      setFormLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Accounts</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your bank accounts, credit cards, and cash
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg px-4 py-2.5 flex items-center gap-2 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            New Account
          </button>
        </div>
      </div>

      <ErrorAlert
        message={error?.message}
        errors={error?.errors}
        onClose={() => setError(null)}
      />

      {accounts.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-glass border border-slate-200/50 dark:border-slate-700/50 p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">No accounts yet</p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline">
            Add your first account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Account</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Main Checking Account"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Account Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank">Bank Account</SelectItem>
                  <SelectItem value="CreditCard">Credit Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="DigitalWallet">Digital Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <CurrencySelector
                value={formData.currency}
                onChange={handleChange}
                name="currency"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialBalance">Initial Balance *</Label>
              <Input
                id="initialBalance"
                name="initialBalance"
                type="number"
                value={formData.initialBalance}
                onChange={handleChange}
                required
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                placeholder="e.g., Bank Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="e.g., ****1234"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40">
                {formLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounts;
