import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = () => {
    let strength = 0;
    const checks = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    if (checks.length) strength += 1;
    if (checks.uppercase) strength += 1;
    if (checks.lowercase) strength += 1;
    if (checks.number) strength += 1;
    if (checks.special) strength += 1;

    return { strength, checks };
  };

  if (!password) return null;

  const { strength, checks } = calculateStrength();

  const getStrengthConfig = () => {
    if (strength <= 2) {
      return {
        label: 'Weak',
        color: 'bg-red-500',
        textColor: 'text-red-500',
        width: '33.33%',
      };
    }
    if (strength <= 3) {
      return {
        label: 'Medium',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-500',
        width: '66.66%',
      };
    }
    return {
      label: 'Strong',
      color: 'bg-green-500',
      textColor: 'text-green-500',
      width: '100%',
    };
  };

  const config = getStrengthConfig();

  const requirements = [
    { label: 'At least 6 characters', met: checks.length },
    { label: 'One uppercase letter', met: checks.uppercase },
    { label: 'One lowercase letter', met: checks.lowercase },
    { label: 'One number', met: checks.number },
  ];

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${config.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: config.width }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.3 }}
        className="space-y-1.5"
      >
        {requirements.map((req, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2"
          >
            <div
              className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                req.met
                  ? 'bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {req.met ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
            </div>
            <span
              className={`text-xs ${
                req.met
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              }`}
            >
              {req.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PasswordStrengthIndicator;
