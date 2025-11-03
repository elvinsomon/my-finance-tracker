import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Globe, Check, Loader2, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    defaultCurrency: 'DOP',
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [validFields, setValidFields] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const currencies = [
    { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
  ];

  // Validate passwords match
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [formData.password, formData.confirmPassword]);

  // Validate fields in real-time
  useEffect(() => {
    const newValidFields = {};

    if (formData.fullName.trim().length >= 2) {
      newValidFields.fullName = true;
    }

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newValidFields.email = true;
    }

    if (
      formData.password.length >= 6 &&
      /[A-Z]/.test(formData.password) &&
      /[a-z]/.test(formData.password) &&
      /[0-9]/.test(formData.password)
    ) {
      newValidFields.password = true;
    }

    if (formData.confirmPassword && passwordsMatch && formData.password) {
      newValidFields.confirmPassword = true;
    }

    setValidFields(newValidFields);
  }, [formData, passwordsMatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific errors
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCurrencyChange = (value) => {
    setFormData(prev => ({
      ...prev,
      defaultCurrency: value,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain a lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain a number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.defaultCurrency) {
      errors.defaultCurrency = 'Please select a currency';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.defaultCurrency
      );

      // Success animation delay before redirect
      await new Promise(resolve => setTimeout(resolve, 500));

      register(response.token, response.user);
      navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 dark:from-purple-950 dark:via-indigo-950 dark:to-pink-950" />

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Register Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <motion.div variants={itemVariants} animate={floatingAnimation}>
          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border-white/20 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <motion.div
                variants={itemVariants}
                className="flex justify-center mb-4"
              >
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <motion.div variants={itemVariants}>
                <CardTitle className="text-3xl font-bold text-white">
                  Create Account
                </CardTitle>
              </motion.div>
              <motion.div variants={itemVariants}>
                <CardDescription className="text-purple-200 dark:text-purple-300">
                  Start managing your finances today
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Alert */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                        <AlertDescription className="text-red-200">
                          {error.message || 'Registration failed. Please try again.'}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Full Name Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 ${
                        fieldErrors.fullName ? 'border-red-500' : ''
                      }`}
                      placeholder="John Doe"
                    />
                    <AnimatePresence>
                      {validFields.fullName && !fieldErrors.fullName && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-xs text-red-400">{fieldErrors.fullName}</p>
                  )}
                </motion.div>

                {/* Email Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 ${
                        fieldErrors.email ? 'border-red-500' : ''
                      }`}
                      placeholder="you@example.com"
                    />
                    <AnimatePresence>
                      {validFields.email && !fieldErrors.email && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-400">{fieldErrors.email}</p>
                  )}
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 ${
                        fieldErrors.password ? 'border-red-500' : ''
                      }`}
                      placeholder="••••••••"
                    />
                    <AnimatePresence>
                      {validFields.password && !fieldErrors.password && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-400">{fieldErrors.password}</p>
                  )}
                  {/* Password Strength Indicator */}
                  <PasswordStrengthIndicator password={formData.password} />
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 ${
                        !passwordsMatch && formData.confirmPassword ? 'border-red-500' : ''
                      }`}
                      placeholder="••••••••"
                    />
                    <AnimatePresence>
                      {validFields.confirmPassword && passwordsMatch && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {!passwordsMatch && formData.confirmPassword && (
                    <p className="text-xs text-red-400">Passwords do not match</p>
                  )}
                </motion.div>

                {/* Currency Selector */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="defaultCurrency" className="text-white">
                    Default Currency
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300 z-10" />
                    <Select
                      value={formData.defaultCurrency}
                      onValueChange={handleCurrencyChange}
                    >
                      <SelectTrigger className="pl-10 bg-white/5 border-white/10 text-white focus:border-purple-400 focus:ring-purple-400/20">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.code}
                            value={currency.code}
                            className="text-white focus:bg-white/10 focus:text-white"
                          >
                            {currency.symbol} {currency.name} ({currency.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </motion.div>

                {/* Sign In Link */}
                <motion.div variants={itemVariants} className="text-center">
                  <p className="text-sm text-purple-200">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-semibold text-white hover:text-purple-300 transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
