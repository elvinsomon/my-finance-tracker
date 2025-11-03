# MainLayout System

Complete layout system for MyFinanceTracker with glassmorphism effects, animations, and responsive design.

## Components

### 1. MainLayout (`MainLayout.jsx`)

The main container component that orchestrates the entire application layout.

**Features:**
- Grid-based layout with sidebar and content area
- Glassmorphism background with gradient overlay and dot pattern
- Page transition animations using framer-motion
- Responsive design (sidebar collapses to overlay on mobile)
- Automatic state management for sidebar (collapsed/expanded)

**Props:**
- `children` - Page content to render inside the layout

**Usage:**
```jsx
import MainLayout from './components/layout/MainLayout';

<MainLayout>
  <YourPageContent />
</MainLayout>
```

### 2. Sidebar (`Sidebar.jsx`)

Navigation sidebar with collapsible functionality and mobile overlay.

**Features:**
- Desktop: Fixed sidebar (expandable/collapsible)
- Mobile: Overlay sidebar (hidden by default)
- Smooth animations with framer-motion
- Active route highlighting with gradient
- Tooltip labels when collapsed
- Glassmorphism styling

**Props:**
- `isCollapsed` (boolean) - Sidebar collapsed state (desktop)
- `isMobileOpen` (boolean) - Sidebar visibility (mobile)
- `onToggle` (function) - Toggle collapse state
- `onClose` (function) - Close mobile sidebar

**Menu Items:**
```javascript
- Dashboard (/)
- Transactions (/transactions)
- Categories (/categories)
- Budgets (/budgets)
- Accounts (/accounts)
- Savings Goals (/savings-goals)
- Reports (/reports)
- Import (/import)
- Export (/export)
```

### 3. TopBar (`TopBar.jsx`)

Top navigation bar with search, notifications, and user menu.

**Features:**
- Sticky positioning
- Mobile menu button
- Search bar (hidden on mobile)
- Theme toggle integration
- Notification bell with badge
- User profile dropdown menu
- Glassmorphism backdrop

**Props:**
- `onMenuClick` (function) - Open mobile sidebar
- `isSidebarCollapsed` (boolean) - Current sidebar state

## Layout Structure

```
┌─────────────────────────────────────────────────┐
│                   Background                    │
│  (Gradient + Dot Pattern + Blur Orbs)          │
│                                                 │
│  ┌──────────┬────────────────────────────────┐ │
│  │          │        TopBar                   │ │
│  │          ├────────────────────────────────┤ │
│  │          │                                 │ │
│  │  Sidebar │        Page Content             │ │
│  │          │        (with transitions)       │ │
│  │          │                                 │ │
│  │          │                                 │ │
│  └──────────┴────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (>= 1024px)
- Sidebar: Fixed, visible, collapsible (256px → 80px)
- Content area: Adjusts margin based on sidebar state
- TopBar: Full width minus sidebar

### Tablet/Mobile (< 1024px)
- Sidebar: Overlay mode, hidden by default
- Content area: Full width
- TopBar: Includes menu button
- Overlay backdrop: Visible when sidebar is open

## Page Transitions

Pages automatically receive fade + slide animations:

**Animation Settings:**
- **Initial**: opacity: 0, y: 20
- **Animate**: opacity: 1, y: 0
- **Exit**: opacity: 0, y: -20
- **Duration**: 250ms
- **Easing**: [0.4, 0, 0.2, 1] (ease-out)

**Implementation:**
```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

## Background System

The MainLayout includes a sophisticated multi-layer background:

### Layer 1: Base Gradient
```css
bg-gradient-to-br from-white via-gray-50 to-blue-50
dark:from-slate-950 dark:via-slate-900 dark:to-blue-950
```

### Layer 2: Dot Pattern
- Radial gradient dots (1px)
- 24px × 24px grid
- Low opacity (3% light, 5% dark)

### Layer 3: Blur Orbs
- Blue orb (top-left quadrant)
- Purple orb (bottom-right quadrant)
- Heavy blur (blur-3xl)
- Very low opacity for subtle depth

## Glass Card Styling

All cards within the layout should use these classes for consistency:

### Standard Glass Card
```jsx
className="
  bg-white/70 dark:bg-slate-800/70
  backdrop-blur-xl
  border border-gray-200/50 dark:border-slate-700/50
  rounded-xl
  shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50
  hover:shadow-xl transition-all duration-300
  p-6
"
```

### Glass Card with Gradient Accent
```jsx
className="
  bg-gradient-to-br from-blue-500/10 to-purple-500/10
  dark:from-blue-400/20 dark:to-purple-400/20
  backdrop-blur-xl
  border border-blue-200/50 dark:border-blue-700/50
  rounded-xl
  p-6
"
```

## Integration

### ProtectedRoute Integration

The layout is integrated via `ProtectedRoute.jsx`:

```jsx
import MainLayout from './layout/MainLayout';

const ProtectedRoute = () => {
  // ... auth logic

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};
```

### App.jsx Structure

```jsx
<Routes>
  {/* Public routes (no layout) */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected routes (with layout) */}
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/transactions" element={<Transactions />} />
    {/* ... other routes */}
  </Route>
</Routes>
```

## Creating Pages

Pages should follow this structure:

```jsx
const YourPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Page Title
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Page description
        </p>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Card content */}
        </div>
      </div>
    </div>
  );
};
```

See `PageExample.jsx` for a complete example.

## Performance Considerations

1. **AnimatePresence mode="wait"**: Ensures only one page transition at a time
2. **Backdrop blur**: Uses `backdrop-blur-xl` for optimal performance
3. **Fixed sidebar**: Only desktop sidebar is fixed; mobile uses transform
4. **Lazy background**: Background layers use absolute positioning with -z-10

## Customization

### Sidebar Width
Edit in `Sidebar.jsx`:
```javascript
variants={{
  desktop: {
    expanded: { width: '16rem' },  // Change this
    collapsed: { width: '5rem' }   // And this
  }
}}
```

Update margin in `MainLayout.jsx`:
```javascript
${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
```

### Animation Duration
Edit in `MainLayout.jsx`:
```javascript
transition={{
  duration: 0.25,  // Change this (in seconds)
  ease: [0.4, 0, 0.2, 1]
}}
```

### Background Colors
Edit gradient in `MainLayout.jsx`:
```jsx
<div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" />
```

## File Structure

```
src/components/layout/
├── MainLayout.jsx      # Main container component
├── Sidebar.jsx         # Navigation sidebar
├── TopBar.jsx          # Top navigation bar
├── PageExample.jsx     # Example page structure
├── index.js            # Barrel exports
└── README.md           # This file
```

## Dependencies

- `react-router-dom` - Routing and navigation
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus visible states
- Reduced motion support (respects prefers-reduced-motion)

## Future Enhancements

- [ ] Breadcrumb navigation
- [ ] Quick search functionality
- [ ] Keyboard shortcuts
- [ ] Pin/unpin sidebar state persistence
- [ ] Custom theme color schemes
- [ ] Customizable sidebar menu items
