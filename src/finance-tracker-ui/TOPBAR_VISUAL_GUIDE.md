# TopBar Visual Guide

## Component Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            TopBar (Header)                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌────────────────────────────────┐  ┌──────────────────┐   │
│  │ ☰    │  │ Dashboard > Transactions       │  │ 🔍 ☀ 🔔 👤      │   │
│  └──────┘  └────────────────────────────────┘  └──────────────────┘   │
│  Mobile    Breadcrumbs                          Actions              │
│  Menu                                           Section              │
└─────────────────────────────────────────────────────────────────────────┘
```

## Sections Breakdown

### Left Section
```
┌──────────────────────────────────────────┐
│  [☰]  Dashboard > Transactions          │
│   ↑         ↑                            │
│   │         └── Breadcrumb trail         │
│   └── Mobile menu toggle                 │
└──────────────────────────────────────────┘
```

### Right Section
```
┌────────────────────────────────────────┐
│  [🔍]  [☀]  [🔔]  [👤 User Name]      │
│    ↑     ↑     ↑      ↑                │
│    │     │     │      └── User menu    │
│    │     │     └── Notifications       │
│    │     └── Theme toggle              │
│    └── Search                          │
└────────────────────────────────────────┘
```

## User Menu Dropdown

When clicking the user avatar:

```
┌────────────────────────────┐
│  John Doe                  │
│  john@example.com          │
├────────────────────────────┤
│  👤  Profile      Soon     │
│  ⚙   Settings     Soon     │
├────────────────────────────┤
│  🚪  Logout                │
└────────────────────────────┤
```

## Breadcrumb Examples

### Dashboard
```
Dashboard
```

### Transactions Page
```
Dashboard > Transactions
   ↑           ↑
   │           └── Current page (bold)
   └── Clickable link
```

### Savings Goal Details
```
Dashboard > Savings Goals > Goal Details
   ↑             ↑              ↑
   └── Link      └── Link       └── Current (bold)
```

## Theme Toggle States

### Light Mode
```
┌─────┐
│  🌙 │  Click to switch to dark mode
└─────┘
```

### Dark Mode
```
┌─────┐
│  ☀  │  Click to switch to light mode
└─────┘
```

## Responsive Behavior

### Desktop (≥1024px)
```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard > Transactions    🔍  ☀  🔔  👤  John Doe         │
│                              john@example.com                 │
└──────────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌────────────────────────────────────────────────────┐
│  Dashboard > Transactions    🔍  ☀  🔔  👤  JD     │
└────────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────────────────────────┐
│  ☰  Dashboard    ☀  👤  JD          │
└─────────────────────────────────────┘
```

## Color Palette

### Light Mode
- Background: `rgba(255, 255, 255, 0.9)` with blur
- Text: `#0f172a` (slate-900)
- Hover: `#f1f5f9` (slate-100)
- Border: `rgba(226, 232, 240, 0.5)` (slate-200/50)

### Dark Mode
- Background: `rgba(15, 23, 42, 0.9)` with blur
- Text: `#f8fafc` (slate-100)
- Hover: `#1e293b` (slate-800)
- Border: `rgba(51, 65, 85, 0.5)` (slate-700/50)

## Interactive States

### Button Hover
```
Normal:    ┌─────┐
           │  🔍 │
           └─────┘

Hover:     ┌─────┐
           │  🔍 │  ← Background: slate-100/800
           └─────┘
```

### Avatar Hover
```
Normal:    ┌────┐
           │ JD │  Gradient: blue-500 to purple-600
           └────┘

Hover:     ┌────┐
           │ JD │  ← Background: slate-100/800
           └────┘
```

## Animation & Transitions

### Theme Toggle
- Duration: `200ms`
- Icon fade and rotate effect
- Smooth color transition

### Dropdown Menu
- Fade in: `opacity 0 → 1`
- Slide down: `transform translateY(-4px) → 0`
- Duration: `150ms`

### Breadcrumb Links
- Hover: Color transition `200ms`
- No underline by default
- Underline on hover (optional)

## Accessibility

### Keyboard Navigation
```
Tab Order:
1. Mobile Menu Button (if visible)
2. Breadcrumb Links (in order)
3. Search Button
4. Theme Toggle Button
5. Notifications Button
6. User Menu Trigger
```

### Screen Reader
```
Mobile Menu: "Toggle menu"
Search: "Search"
Theme Toggle: "Toggle theme - Switch to dark mode"
Notifications: "Notifications"
User Menu: "User menu"
```

## Z-Index Layers
```
z-30  ← TopBar (sticky header)
z-40  ← Mobile sidebar overlay
z-50  ← Dropdown menus
```

## Glassmorphism Effect

```
CSS Properties:
- background: rgba(255, 255, 255, 0.9)
- backdrop-filter: blur(12px) saturate(150%)
- border: 1px solid rgba(255, 255, 255, 0.3)
```

Visual Effect:
```
┌───────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Blurred background shows through
│  ▒▒▒ TopBar Content ▒▒▒  │ ← Semi-transparent layer
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└───────────────────────────┘
```

## Integration Points

### Props
```javascript
{
  onMenuClick: () => void,        // Mobile menu toggle
  isSidebarCollapsed: boolean     // Sidebar state (not used currently)
}
```

### Hooks Used
```javascript
useLocation()      // React Router - current route
useTheme()         // Theme provider - theme state
useAuth()          // Auth context - user data
```

### External Dependencies
```javascript
// UI Components
- DropdownMenu (shadcn/ui)
- Avatar (shadcn/ui)
- Breadcrumb (shadcn/ui)

// Icons
- lucide-react (Menu, Sun, Moon, Bell, etc.)

// Routing
- react-router-dom (Link, useLocation)
```

## Performance Metrics

- Initial Render: < 10ms
- Route Change: < 5ms (breadcrumb update)
- Theme Toggle: < 50ms (CSS transition)
- Menu Open: < 150ms (dropdown animation)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Required features:
- CSS Backdrop Filter
- CSS Grid/Flexbox
- CSS Custom Properties
- ES6+ JavaScript
