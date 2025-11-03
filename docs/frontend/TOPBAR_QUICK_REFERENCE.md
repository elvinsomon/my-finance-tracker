# TopBar Quick Reference

## Component Location
```
/src/components/layout/TopBar.jsx
```

## Usage
```jsx
import TopBar from './components/layout/TopBar';

<TopBar
  onMenuClick={handleMenuClick}
  isSidebarCollapsed={isCollapsed}
/>
```

## Add New Route to Breadcrumbs

Edit the `routeMap` object in TopBar.jsx:

```javascript
const routeMap = {
  // Add your new route here
  '/your-new-route': { label: 'Your Route Name', parent: '/' },

  // Example: Add a settings page
  '/settings': { label: 'Settings', parent: '/' },

  // Example: Nested route
  '/settings/profile': { label: 'Profile', parent: '/settings' },
};
```

## Customize User Menu

Find the dropdown section and add new items:

```jsx
<DropdownMenuContent align="end" className="w-56 glass-strong">
  <DropdownMenuLabel>...</DropdownMenuLabel>
  <DropdownMenuSeparator />

  {/* Add your custom menu item here */}
  <DropdownMenuItem onClick={handleYourAction}>
    <YourIcon className="w-4 h-4 mr-2" />
    Your Menu Item
  </DropdownMenuItem>

  <DropdownMenuSeparator />
  <DropdownMenuItem onClick={logout}>...</DropdownMenuItem>
</DropdownMenuContent>
```

## Enable Search Functionality

Replace the search button with a functional component:

```jsx
// Replace this:
<button
  className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
  aria-label="Search"
  title="Search (Coming Soon)"
>
  <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
</button>

// With this:
<button
  onClick={handleSearchClick}
  className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
  aria-label="Search"
>
  <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
</button>
```

## Enable Notifications

Uncomment the notification badge and add functionality:

```jsx
<button
  onClick={handleNotificationsClick}
  className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
  aria-label="Notifications"
>
  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
  {/* Show badge if there are unread notifications */}
  {unreadCount > 0 && (
    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
  )}
</button>
```

## Modify Avatar Style

Change the avatar gradient:

```jsx
<AvatarFallback className="bg-gradient-to-br from-[your-color] to-[your-color] text-white text-sm font-medium">
  {getUserInitials()}
</AvatarFallback>
```

Example gradients:
- `from-blue-500 to-purple-600` (default)
- `from-green-500 to-teal-600` (green theme)
- `from-pink-500 to-rose-600` (pink theme)
- `from-amber-500 to-orange-600` (warm theme)

## Change Theme Toggle Icon

Modify the theme toggle button:

```jsx
<button
  onClick={toggleTheme}
  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
>
  {effectiveTheme === 'dark' ? (
    <YourLightIcon className="w-5 h-5" />
  ) : (
    <YourDarkIcon className="w-5 h-5" />
  )}
</button>
```

## Adjust Height

Change the header height:

```jsx
// Change h-16 to your desired height
<header className="sticky top-0 z-30 h-20 border-b ...">
```

Common heights:
- `h-14` (56px)
- `h-16` (64px) - current
- `h-20` (80px)
- `h-24` (96px)

## Modify Glassmorphism

Change the background effect:

```jsx
// More transparent
<div className="absolute inset-0 glass backdrop-blur-xl" />

// More opaque
<div className="absolute inset-0 glass-strong backdrop-blur-2xl" />

// Subtle
<div className="absolute inset-0 glass-subtle backdrop-blur-sm" />
```

## Add Animation to Breadcrumbs

Add motion to breadcrumb items:

```jsx
import { motion } from 'framer-motion';

<motion.div
  key={crumb.path}
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.2 }}
>
  {/* Breadcrumb content */}
</motion.div>
```

## Customize Dropdown Menu Style

Change dropdown appearance:

```jsx
<DropdownMenuContent
  align="end"
  className="w-56 glass-strong" // Custom styles here
>
```

Options:
- `w-48`, `w-56`, `w-64` - Width
- `glass`, `glass-strong`, `glass-subtle` - Glassmorphism
- Add `shadow-xl` for more depth
- Add `border-2` for thicker borders

## Debug Mode

Add console logs to track behavior:

```javascript
// In generateBreadcrumbs()
console.log('Current pathname:', location.pathname);
console.log('Generated breadcrumbs:', breadcrumbs);

// In user menu
console.log('User data:', user);
console.log('User initials:', getUserInitials());
```

## Common Issues & Solutions

### Breadcrumbs not updating
- Check if route is in `routeMap`
- Verify `useLocation()` hook is working
- Check React Router setup

### Theme toggle not working
- Verify `useTheme()` hook connection
- Check theme provider in App.jsx
- Inspect browser localStorage for theme

### User menu not showing data
- Check `useAuth()` hook
- Verify AuthContext provider
- Check localStorage for user data

### Dropdown menu not appearing
- Verify z-index (should be z-50+)
- Check parent overflow properties
- Inspect Radix UI installation

## Performance Tips

1. **Memoize breadcrumbs** if routes are complex:
```javascript
const breadcrumbs = useMemo(
  () => generateBreadcrumbs(),
  [location.pathname]
);
```

2. **Debounce search input** if adding search:
```javascript
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);
```

3. **Lazy load user avatar** if from URL:
```jsx
<AvatarImage
  src={user?.avatarUrl}
  loading="lazy"
  alt={user?.name}
/>
```

## Styling Tokens

Quick reference for common colors:

```javascript
// Text colors
'text-slate-900 dark:text-slate-100'  // Primary text
'text-slate-600 dark:text-slate-400'  // Secondary text
'text-slate-500 dark:text-slate-400'  // Tertiary text

// Background colors
'bg-slate-100 dark:bg-slate-800'      // Hover state
'bg-slate-50 dark:bg-slate-900'       // Subtle background

// Border colors
'border-slate-200 dark:border-slate-700'  // Normal border
```

## Testing Checklist

```bash
# Test breadcrumbs
- [ ] Navigate to each route
- [ ] Click breadcrumb links
- [ ] Check nested routes

# Test theme toggle
- [ ] Toggle to dark mode
- [ ] Toggle to light mode
- [ ] Refresh page (persistence)

# Test user menu
- [ ] Click avatar
- [ ] Check user info display
- [ ] Click logout
- [ ] Check disabled items

# Test responsive
- [ ] Desktop view (≥1024px)
- [ ] Tablet view (768-1023px)
- [ ] Mobile view (<768px)

# Test interactions
- [ ] Hover states
- [ ] Focus states (keyboard)
- [ ] Click animations
```

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── TopBar.jsx          ← Main component
│   │   ├── MainLayout.jsx      ← Parent layout
│   │   └── Sidebar.jsx         ← Sibling component
│   └── ui/
│       ├── dropdown-menu.jsx   ← shadcn
│       ├── avatar.jsx          ← shadcn
│       └── breadcrumb.jsx      ← shadcn
├── hooks/
│   └── useAuth.js              ← Auth hook
├── lib/
│   └── theme-provider.jsx      ← Theme hook
└── context/
    └── AuthContext.jsx         ← Auth context
```

## Dependencies

Required packages:

```json
{
  "lucide-react": "Latest",
  "react-router-dom": "^6.x",
  "@radix-ui/react-dropdown-menu": "Latest",
  "@radix-ui/react-avatar": "Latest",
  "@radix-ui/react-slot": "Latest"
}
```

Install with:
```bash
npm install lucide-react react-router-dom
npx shadcn@latest add dropdown-menu avatar breadcrumb
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
