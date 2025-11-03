import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import ErrorAlert from '../components/ErrorAlert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      login(response.token, response.user);
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
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const orbVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const errorVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950" />

        {/* Animated gradient orbs */}
        <motion.div
          variants={orbVariants}
          animate="animate"
          className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-cyan-600 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          variants={orbVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          variants={orbVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400 to-blue-400 dark:from-indigo-600 dark:to-blue-600 rounded-full blur-3xl opacity-20"
        />

        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Brand */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50 mb-4">
            <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            MyFinanceTracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Your personal finance companion
          </p>
        </motion.div>

        {/* Glass Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/5 dark:shadow-black/20">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Alert */}
                {error && (
                  <motion.div
                    variants={errorVariants}
                    initial="hidden"
                    animate={["visible", "shake"]}
                  >
                    <ErrorAlert
                      message={error?.message}
                      errors={error?.errors}
                      onClose={() => setError(null)}
                    />
                  </motion.div>
                )}

                {/* Email Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@example.com"
                      className={`
                        pl-11 h-12
                        bg-white/50 dark:bg-slate-800/50
                        border-gray-200 dark:border-gray-700
                        focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
                        focus-visible:border-blue-500 dark:focus-visible:border-blue-400
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        transition-all duration-200
                        ${focusedField === 'email' ? 'shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20' : ''}
                      `}
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your password"
                      className={`
                        pl-11 h-12
                        bg-white/50 dark:bg-slate-800/50
                        border-gray-200 dark:border-gray-700
                        focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
                        focus-visible:border-blue-500 dark:focus-visible:border-blue-400
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        transition-all duration-200
                        ${focusedField === 'password' ? 'shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20' : ''}
                      `}
                    />
                  </div>
                </motion.div>

                {/* Forgot Password Link */}
                <motion.div variants={itemVariants} className="flex justify-end">
                  <button
                    type="button"
                    disabled
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-not-allowed opacity-50"
                  >
                    Forgot password?
                  </button>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 dark:hover:shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <LogIn className="w-5 h-5" />
                        <span>Sign In</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <motion.div variants={itemVariants} className="text-center w-full">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Footer Text */}
        <motion.div variants={itemVariants} className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Secure authentication powered by JWT
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
