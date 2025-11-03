# TransactionModal Visual Guide

## Component Structure Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│ Dialog (Radix UI Root)                                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ DialogOverlay (Semi-transparent backdrop with blur)       │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ DialogContent (Modal Container)                     │  │  │
│  │  │ [Glassmorphism: white/95 | slate-900/95]           │  │  │
│  │  │ [backdrop-blur-xl, rounded corners, shadow]        │  │  │
│  │  │                                           ╳ (Close) │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │ DialogHeader                                  │  │  │  │
│  │  │  │  ┌─────────────────────────────────────────┐  │  │  │  │
│  │  │  │  │ DialogTitle                             │  │  │  │  │
│  │  │  │  │ "New Transaction" / "Edit Transaction"  │  │  │  │  │
│  │  │  │  │ [2xl, bold, gray-900/white]             │  │  │  │  │
│  │  │  │  └─────────────────────────────────────────┘  │  │  │  │
│  │  │  │  ┌─────────────────────────────────────────┐  │  │  │  │
│  │  │  │  │ DialogDescription                       │  │  │  │  │
│  │  │  │  │ "Add a new financial transaction"       │  │  │  │  │
│  │  │  │  │ [gray-600/gray-400]                     │  │  │  │  │
│  │  │  │  └─────────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │ ErrorAlert (Conditional)                      │  │  │  │
│  │  │  │ Shows validation/submission errors            │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │ Form (space-y-4)                              │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────┬─────────────┐               │  │  │  │
│  │  │  │  │ Account     │ Category    │ [Grid 2 cols] │  │  │  │
│  │  │  │  │ [Select]    │ [Select]    │               │  │  │  │
│  │  │  │  └─────────────┴─────────────┘               │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────┬─────────────┐               │  │  │  │
│  │  │  │  │ Type        │ Date        │               │  │  │  │
│  │  │  │  │ [Select]    │ [Input]     │               │  │  │  │
│  │  │  │  └─────────────┴─────────────┘               │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────┬─────────────┐               │  │  │  │
│  │  │  │  │ Amount      │ Currency    │               │  │  │  │
│  │  │  │  │ [Input]     │ [Select]    │               │  │  │  │
│  │  │  │  └─────────────┴─────────────┘               │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐     │  │  │  │
│  │  │  │  │ Description [Input - Full width]    │     │  │  │  │
│  │  │  │  └─────────────────────────────────────┘     │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────┬─────────────┐               │  │  │  │
│  │  │  │  │ Payment     │ Merchant    │               │  │  │  │
│  │  │  │  │ Method      │             │               │  │  │  │
│  │  │  │  └─────────────┴─────────────┘               │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐     │  │  │  │
│  │  │  │  │ Notes [Textarea - 3 rows]           │     │  │  │  │
│  │  │  │  │                                     │     │  │  │  │
│  │  │  │  └─────────────────────────────────────┘     │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ────────────────────────────────────────    │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ☐ Add detailed items (optional)   2 items   │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐     │  │  │  │
│  │  │  │  │ ItemsTable (Conditional)            │     │  │  │  │
│  │  │  │  │ [gray-50/slate-800 background]      │     │  │  │  │
│  │  │  │  │                                     │     │  │  │  │
│  │  │  │  │ ⓘ Items total must match           │     │  │  │  │
│  │  │  │  │   transaction amount above          │     │  │  │  │
│  │  │  │  └─────────────────────────────────────┘     │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ────────────────────────────────────────    │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌──────────────────────────────────┐        │  │  │  │
│  │  │  │  │           [Cancel] [Create/Update]│       │  │  │  │
│  │  │  │  └──────────────────────────────────┘        │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Light Mode
```
Background:     bg-white/95              (rgba(255, 255, 255, 0.95))
Backdrop:       backdrop-blur-xl         (Heavy blur effect)
Borders:        border-gray-200/50       (Light gray, semi-transparent)
Text (Primary): text-gray-900            (#111827)
Text (Label):   text-gray-700            (#374151)
Text (Desc):    text-gray-600            (#4B5563)
Inputs:         bg-white/50              (Semi-transparent white)
Focus Ring:     ring-blue-500            (#3B82F6)
Primary Button: from-blue-600 to-blue-700 (Gradient)
```

### Dark Mode
```
Background:     dark:bg-slate-900/95     (rgba(15, 23, 42, 0.95))
Backdrop:       backdrop-blur-xl         (Heavy blur effect)
Borders:        dark:border-gray-700/50  (Dark gray, semi-transparent)
Text (Primary): dark:text-white          (#FFFFFF)
Text (Label):   dark:text-gray-300       (#D1D5DB)
Text (Desc):    dark:text-gray-400       (#9CA3AF)
Inputs:         dark:bg-slate-800/50     (Semi-transparent slate)
Focus Ring:     dark:ring-blue-400       (#60A5FA)
Primary Button: dark:from-blue-500 dark:to-blue-600 (Gradient)
```

## Component Breakdown

### 1. Dialog Root
```jsx
<Dialog open={true} onOpenChange={() => onClose(false)}>
```
- Controls modal visibility
- `open={true}` keeps it always open when rendered
- `onOpenChange` handles close events (X button, overlay click, Escape key)

### 2. DialogContent
```jsx
<DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
  border-gray-200/50 dark:border-gray-700/50 sm:max-w-2xl max-h-[90vh]
  overflow-y-auto">
```
- **Max width**: 2xl (672px) on desktop
- **Max height**: 90% viewport height
- **Scrollable**: overflow-y-auto for long forms
- **Glassmorphism**: Semi-transparent backgrounds with blur

### 3. DialogHeader
Contains title and description with semantic structure

### 4. Form Layout
**Grid System**:
- 2-column grid on desktop (md:grid-cols-2)
- Single column on mobile
- Gap of 1rem between fields

**Field Structure**:
```jsx
<div className="space-y-2">
  <Label htmlFor="fieldId">Field Name *</Label>
  <Input
    id="fieldId"
    name="fieldName"
    value={formData.fieldName}
    onChange={handleChange}
    className="[styling]"
  />
</div>
```

## Input Field States

### Default State
```
┌─────────────────────────────────────┐
│ Brief description                   │ Light: white/50 bg
└─────────────────────────────────────┘ Dark:  slate-800/50 bg
  Border: gray-200 / gray-700
```

### Focus State
```
┌─────────────────────────────────────┐
│ Brief description                   │ Blue ring appears
└─────────────────────────────────────┘ Light: blue-500
  Border: blue-500 / blue-400           Dark:  blue-400
```

### Error State (via ErrorAlert)
```
┌─────────────────────────────────────┐
│ ⚠ Error Message Here                │ Red background
│ • Error detail 1                    │ Red text
│ • Error detail 2                    │ Dismissible
└─────────────────────────────────────┘
```

### Disabled State
```
┌─────────────────────────────────────┐
│ Field content                       │ Reduced opacity
└─────────────────────────────────────┘ Cursor: not-allowed
  Opacity: 50%
```

## Button States

### Primary Button (Create/Update)
```
Default:    [━━━ Create Transaction ━━━]  Blue gradient
Hover:      [━━━ Create Transaction ━━━]  Darker blue
Loading:    [⟳━━ Saving... ━━]            Spinner + text
Disabled:   [━━━ Create Transaction ━━━]  50% opacity
```

### Cancel Button (Outline)
```
Default:    [─── Cancel ───]  Gray border
Hover:      [─── Cancel ───]  Light gray bg
Disabled:   [─── Cancel ───]  50% opacity
```

## Items Section

### Collapsed
```
☐ Add detailed items (optional)
```

### Expanded (No Items)
```
☑ Add detailed items (optional)

┌─────────────────────────────────────────────┐
│ [Add Item Button]                           │
│                                             │
│ (Empty state)                               │
└─────────────────────────────────────────────┘
```

### Expanded (With Items)
```
☑ Add detailed items (optional)         2 items

┌─────────────────────────────────────────────┐
│ Category    Description  Qty  Price  Total  │
│ ─────────────────────────────────────────── │
│ 🍔 Food     Burger       1    $5.00  $5.00  │
│ 🥤 Food     Drink        2    $2.00  $4.00  │
│ ─────────────────────────────────────────── │
│                                       $9.00  │
│ [Add Item]                                  │
│                                             │
│ ⓘ Items total must match transaction       │
│   amount above                              │
└─────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (≥768px)
- Two-column grid for fields
- Max width: 672px
- Modal centered on screen
- Comfortable padding and spacing

### Tablet (640px - 767px)
- Two-column grid maintained
- Slightly reduced padding
- Modal adapts to width

### Mobile (<640px)
- Single column layout
- Full-width inputs
- Reduced padding
- Optimized for touch
- Scrollable content

## Accessibility Features

### Keyboard Navigation
- **Tab**: Move between fields
- **Shift+Tab**: Move backward
- **Escape**: Close modal
- **Enter**: Submit form (when in input)
- **Space**: Toggle checkbox

### Screen Reader
- All inputs have associated labels
- DialogTitle announced as modal title
- DialogDescription provides context
- Error messages announced
- Button states announced

### Focus Management
- Focus trapped within modal
- Focus returns to trigger on close
- Logical tab order
- Visible focus indicators

## Animation Sequence

### Opening
```
1. Overlay fades in    (fade-in-0)
2. Content zooms in    (zoom-in-95)
3. Content slides up   (slide-in-from-top-[48%])
   Duration: 200ms
```

### Closing
```
1. Content slides down (slide-out-to-top-[48%])
2. Content zooms out   (zoom-out-95)
3. Overlay fades out   (fade-out-0)
   Duration: 200ms
```

## Dark Mode Toggle Example

```
Light Mode                    Dark Mode
┌─────────────────┐         ┌─────────────────┐
│ New Transaction │         │ New Transaction │
│ (black text)    │   →     │ (white text)    │
├─────────────────┤         ├─────────────────┤
│ [White inputs]  │         │ [Slate inputs]  │
│ [Gray borders]  │         │ [Gray borders]  │
│ [Blue buttons]  │         │ [Blue buttons]  │
└─────────────────┘         └─────────────────┘
  White bg                     Slate bg
  Light text                   Light text
```

## Form Validation Flow

```
User fills form
     ↓
Clicks Create/Update
     ↓
Client validation
     ↓
     ├─ Invalid ──→ Show ErrorAlert
     │              Stay on form
     │
     └─ Valid ──→ Show loading state
                   ↓
              Submit to API
                   ↓
                   ├─ Success ──→ onClose(true)
                   │              Parent refreshes
                   │
                   └─ Error ──→ Show ErrorAlert
                              Stay on form
```

## CSS Classes Reference

### Container Classes
```css
.backdrop-blur-xl     /* Heavy blur (24px) */
.max-h-[90vh]        /* 90% viewport height */
.overflow-y-auto     /* Vertical scroll */
.sm:max-w-2xl        /* 672px max width */
```

### Spacing Classes
```css
.space-y-2           /* 0.5rem vertical gap */
.space-y-4           /* 1rem vertical gap */
.gap-3               /* 0.75rem gap */
.gap-4               /* 1rem gap */
.p-4                 /* 1rem padding all sides */
.pt-4                /* 1rem padding top */
```

### Color Classes
```css
.bg-white/95         /* White at 95% opacity */
.bg-white/50         /* White at 50% opacity */
.border-gray-200/50  /* Gray border at 50% opacity */
.text-gray-900       /* Near black text */
.text-gray-700       /* Dark gray text */
```

### Interactive Classes
```css
.focus-visible:outline-none       /* Remove default outline */
.focus-visible:ring-2             /* Add 2px ring */
.focus-visible:ring-blue-500      /* Blue focus ring */
.focus-visible:ring-offset-2      /* 2px ring offset */
.hover:bg-gray-50                 /* Light gray on hover */
.disabled:opacity-50              /* 50% opacity when disabled */
.disabled:cursor-not-allowed      /* Not-allowed cursor */
```

---

## Summary

The TransactionModal provides a comprehensive, accessible form for creating and editing financial transactions. The refactored version uses shadcn Dialog components for consistency, includes full dark mode support with glassmorphism effects, and maintains all original functionality while improving the user experience through better accessibility, animations, and responsive design.
