# Glassmorphism Design System Guide

This guide provides instructions on using the glassmorphism effects and dark mode theme in the Finance Tracker UI.

## Table of Contents

1. [Theme Configuration](#theme-configuration)
2. [Using the Theme](#using-the-theme)
3. [Glassmorphism Utilities](#glassmorphism-utilities)
4. [Examples](#examples)
5. [Custom Components](#custom-components)

---

## Theme Configuration

### Dark Mode Strategy

The application uses Tailwind CSS v4 with `class` strategy for dark mode:

```javascript
// tailwind.config.js
darkMode: 'class'
```

### Color Palette

The design system extends the default Tailwind palette with custom colors:

- **Income**: Green shades for positive financial indicators
- **Expense**: Red shades for negative financial indicators
- **Primary**: Blue shades for primary UI elements

All color scales include 950 shades for enhanced dark mode support.

---

## Using the Theme

### ThemeProvider

The app is wrapped with `ThemeProvider` which manages theme state:

```jsx
import { ThemeProvider } from './lib/theme-provider';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### useTheme Hook

Access theme state and controls in any component:

```jsx
import { useTheme } from '../lib/theme-provider';

function MyComponent() {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Effective theme: {effectiveTheme}</p>

      {/* Set specific theme */}
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('system')}>System</button>

      {/* Toggle between light/dark */}
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### Theme Persistence

Theme preference is automatically saved to localStorage and persists across sessions.

---

## Glassmorphism Utilities

All glassmorphism utilities automatically adapt to light and dark modes.

### Base Classes

#### `.glass`
Basic glass effect with transparency and blur.

```jsx
<div className="glass">
  Semi-transparent blurred background
</div>
```

**Properties:**
- Light: `bg-white/70` with `backdrop-blur-md`
- Dark: `bg-slate-900/70` with `backdrop-blur-md`
- Border: `border-white/20` (light) / `border-white/10` (dark)

---

#### `.glass-card`
Glass effect with shadow and rounded corners.

```jsx
<div className="glass-card p-6">
  <h3>Card Title</h3>
  <p>Card content with glassmorphism effect</p>
</div>
```

**Properties:**
- Includes all `.glass` properties
- Shadow: `shadow-glass`
- Border radius: `rounded-xl` (0.75rem)
- Smooth transitions on all properties

---

#### `.glass-card-hover`
Interactive glass card with hover effects.

```jsx
<div className="glass-card-hover p-6">
  Hover me for scale and shadow effects
</div>
```

**Hover Effects:**
- Scales to 102%
- Enhanced shadow (`shadow-glass-lg`)
- Increased opacity

---

#### `.glass-panel`
Larger glass container for sections.

```jsx
<div className="glass-panel">
  <h2>Section Title</h2>
  <p>Section content</p>
</div>
```

**Properties:**
- Includes all `.glass` properties
- Shadow: `shadow-glass-lg`
- Border radius: `rounded-2xl` (1rem)
- Padding: `p-6` (1.5rem)

---

### Glass Variants

#### `.glass-subtle`
Lighter, more transparent glass effect.

```jsx
<div className="glass-subtle p-4">
  Subtle background effect
</div>
```

**Use cases:** Overlays, secondary cards, backgrounds

---

#### `.glass-strong`
Stronger, less transparent glass effect.

```jsx
<div className="glass-strong p-4">
  More opaque with stronger blur
</div>
```

**Use cases:** Primary modals, important content containers

---

### Financial Card Styles

#### `.card-income`
Glass card with green income accent.

```jsx
<div className="card-income p-6">
  <h4>Income</h4>
  <p className="text-2xl font-bold text-income-600 dark:text-income-400">
    +$1,234.56
  </p>
</div>
```

**Features:**
- Green border with income color
- Hover effect with increased border opacity

---

#### `.card-expense`
Glass card with red expense accent.

```jsx
<div className="card-expense p-6">
  <h4>Expenses</h4>
  <p className="text-2xl font-bold text-expense-600 dark:text-expense-400">
    -$987.65
  </p>
</div>
```

**Features:**
- Red border with expense color
- Hover effect with increased border opacity

---

### Depth Utilities

Add layered shadows for depth perception.

```jsx
<div className="depth-1">Subtle depth</div>
<div className="depth-2">Medium depth</div>
<div className="depth-3">Strong depth</div>
```

---

### Transition Utilities

#### `.transition-smooth`
Smooth transitions (300ms ease-in-out)

```jsx
<div className="transition-smooth hover:scale-105">
  Smooth animation
</div>
```

#### `.transition-fast`
Fast transitions (200ms ease-in-out)

```jsx
<button className="transition-fast hover:bg-primary-600">
  Quick response
</button>
```

---

### Interactive States

#### `.interactive-scale`
Scale down on click for tactile feedback.

```jsx
<button className="interactive-scale">
  Click me
</button>
```

**Effect:** Scales to 95% on active state

---

### Gradient Overlays

#### `.gradient-overlay-light`
Light gradient background.

```jsx
<div className="gradient-overlay-light">
  Content with light gradient
</div>
```

#### `.gradient-overlay-dark`
Dark gradient background.

```jsx
<div className="gradient-overlay-dark">
  Content with dark gradient
</div>
```

---

### Backdrop Effects

#### `.backdrop-glass`
Blurred backdrop for modals and overlays.

```jsx
<div className="fixed inset-0 backdrop-glass">
  <div className="glass-panel">
    Modal content
  </div>
</div>
```

---

### Text Depth

#### `.text-depth`
Subtle text shadow for light backgrounds.

```jsx
<h1 className="text-depth text-4xl font-bold">
  Title with depth
</h1>
```

#### `.text-depth-dark`
Stronger text shadow for contrast.

```jsx
<h1 className="text-depth-dark text-4xl font-bold">
  Title with strong shadow
</h1>
```

---

## Examples

### Dashboard Card Example

```jsx
function StatCard({ title, value, trend, type }) {
  const cardClass = type === 'income' ? 'card-income' : 'card-expense';
  const textClass = type === 'income'
    ? 'text-income-600 dark:text-income-400'
    : 'text-expense-600 dark:text-expense-400';

  return (
    <div className={`${cardClass} p-6`}>
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {title}
      </h3>
      <p className={`text-3xl font-bold mt-2 ${textClass}`}>
        {value}
      </p>
      <p className="text-xs mt-2 text-slate-500 dark:text-slate-500">
        {trend}
      </p>
    </div>
  );
}

// Usage
<StatCard
  title="Total Income"
  value="+$5,432.10"
  trend="↑ 12% from last month"
  type="income"
/>
```

---

### Modal Example

```jsx
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-glass flex items-center justify-center p-4">
      <div className="glass-strong max-w-lg w-full p-8 rounded-2xl">
        <button
          onClick={onClose}
          className="interactive-scale float-right p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-fast"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
```

---

### Transaction List Item

```jsx
function TransactionItem({ transaction }) {
  const isIncome = transaction.type === 'income';

  return (
    <div className="glass-card-hover p-4 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isIncome ? 'bg-income-100 dark:bg-income-900/30' : 'bg-expense-100 dark:bg-expense-900/30'
          }`}>
            <span className={isIncome ? 'text-income-600' : 'text-expense-600'}>
              {transaction.icon}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {transaction.description}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {transaction.category}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold ${
            isIncome
              ? 'text-income-600 dark:text-income-400'
              : 'text-expense-600 dark:text-expense-400'
          }`}>
            {isIncome ? '+' : '-'}${transaction.amount}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {transaction.date}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### Chart Container

```jsx
function ChartCard({ title, children }) {
  return (
    <div className="glass-panel">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <div className="bg-white/50 dark:bg-slate-950/50 rounded-lg p-4">
        {children}
      </div>
    </div>
  );
}
```

---

## Custom Components

### ThemeToggle Component

Already created at `/src/components/ThemeToggle.jsx`:

```jsx
import ThemeToggle from './components/ThemeToggle';

// Add to your layout/navbar
<ThemeToggle />
```

---

## Best Practices

### 1. Layer Your Glass Effects

Use different glass variants to create visual hierarchy:

```jsx
<div className="glass-subtle">
  Background layer
  <div className="glass-card">
    Mid layer
    <div className="glass-strong">
      Foreground layer
    </div>
  </div>
</div>
```

### 2. Combine with Depth

Enhance glass effects with depth utilities:

```jsx
<div className="glass-card depth-2">
  Card with depth and glass effect
</div>
```

### 3. Use Transitions

Add smooth transitions for better UX:

```jsx
<div className="glass-card transition-smooth hover:shadow-glass-lg">
  Smooth hover effect
</div>
```

### 4. Consider Accessibility

Always ensure sufficient contrast:

```jsx
<div className="glass-card">
  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
    High contrast title
  </h3>
  <p className="text-slate-700 dark:text-slate-300">
    Readable content text
  </p>
</div>
```

### 5. Test in Both Themes

Always verify your components in both light and dark modes to ensure proper contrast and visibility.

---

## Color Reference

### Income Colors
```jsx
className="text-income-600 dark:text-income-400"     // Text
className="bg-income-500"                            // Background
className="border-income-500/20"                     // Border with opacity
```

### Expense Colors
```jsx
className="text-expense-600 dark:text-expense-400"   // Text
className="bg-expense-500"                           // Background
className="border-expense-500/20"                    // Border with opacity
```

### Primary Colors
```jsx
className="text-primary-600 dark:text-primary-400"   // Text
className="bg-primary-500"                           // Background
className="hover:bg-primary-600"                     // Hover state
```

---

## Troubleshooting

### Glass effect not showing

Ensure parent has a contrasting background or background image for the blur to be visible.

### Dark mode not working

1. Check ThemeProvider is wrapping your app
2. Verify `darkMode: 'class'` in tailwind.config.js
3. Ensure `dark:` variants are used in your classes

### Colors not displaying correctly

Make sure you're using the correct color scale (50-950) and applying dark mode variants where needed.

---

## Migration Guide

### Converting existing components

Before:
```jsx
<div className="bg-white rounded-lg shadow-md p-6">
  Content
</div>
```

After:
```jsx
<div className="glass-card p-6">
  Content
</div>
```

---

## Additional Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Glassmorphism Design Trend](https://hype4.academy/articles/design/glassmorphism-in-user-interfaces)
- Project Tailwind Config: `/tailwind.config.js`
- Custom CSS: `/src/index.css`
