# Design System - Investment Portfolio Management App

## Design Principles

1. **Clarity**: Financial data must be clear, accurate, and easy to understand
2. **Trust**: Professional appearance that inspires confidence
3. **Efficiency**: Quick access to important information
4. **Accessibility**: WCAG 2.1 AA compliant for all users
5. **Consistency**: Uniform patterns across all features

---

## Color Palette

### Primary Colors
- **Primary**: `#1976d2` (Blue) - Trust, stability, finance
- **Primary Light**: `#42a5f5`
- **Primary Dark**: `#1565c0`

### Secondary Colors
- **Secondary**: `#2e7d32` (Green) - Positive gains, growth
- **Secondary Light**: `#4caf50`
- **Secondary Dark**: `#1b5e20`

### Semantic Colors
- **Success**: `#2e7d32` (Green) - Positive values, gains
- **Error**: `#d32f2f` (Red) - Negative values, losses, errors
- **Warning**: `#ed6c02` (Orange) - Alerts, warnings
- **Info**: `#0288d1` (Light Blue) - Information, neutral

### Neutral Colors
- **Background**: `#ffffff` (White)
- **Surface**: `#f5f5f5` (Light Gray)
- **Border**: `#e0e0e0` (Gray)
- **Text Primary**: `#212121` (Near Black)
- **Text Secondary**: `#757575` (Gray)
- **Text Disabled**: `#bdbdbd` (Light Gray)

### Dark Mode
- **Background**: `#121212`
- **Surface**: `#1e1e1e`
- **Border**: `#2c2c2c`
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#b0b0b0`

---

## Typography

### Font Family
- **Primary**: `'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif`
- **Monospace**: `'Roboto Mono', 'Courier New', monospace` (for numbers)

### Font Sizes
- **H1**: 32px / 2rem - Page titles
- **H2**: 24px / 1.5rem - Section headers
- **H3**: 20px / 1.25rem - Card titles
- **H4**: 18px / 1.125rem - Subsection headers
- **Body**: 16px / 1rem - Default text
- **Small**: 14px / 0.875rem - Secondary text, labels
- **Caption**: 12px / 0.75rem - Captions, footnotes

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Bold**: 700

### Line Height
- **Headings**: 1.2
- **Body**: 1.5
- **Dense**: 1.4 (for tables)

---

## Spacing System

Based on 8px grid:
- **xs**: 4px (0.5rem)
- **sm**: 8px (1rem)
- **md**: 16px (2rem)
- **lg**: 24px (3rem)
- **xl**: 32px (4rem)
- **xxl**: 48px (6rem)

---

## Layout

### Breakpoints
- **xs**: 0px - Mobile portrait
- **sm**: 600px - Mobile landscape
- **md**: 960px - Tablet
- **lg**: 1280px - Desktop
- **xl**: 1920px - Large desktop

### Container
- **Max Width**: 1440px
- **Padding**: 16px (mobile), 24px (tablet), 32px (desktop)

### Grid
- 12-column grid system
- Gutter: 16px (mobile), 24px (desktop)

---

## Components

### Buttons

#### Primary Button
- Background: Primary color
- Text: White
- Padding: 8px 16px
- Border Radius: 4px
- Font Weight: 500
- Text Transform: None

#### Secondary Button
- Background: Transparent
- Border: 1px solid primary
- Text: Primary color
- Padding: 8px 16px

#### Text Button
- Background: Transparent
- Text: Primary color
- No border
- Padding: 8px 16px

### Cards
- Background: Surface color
- Border: 1px solid border color
- Border Radius: 8px
- Padding: 16px (mobile), 24px (desktop)
- Box Shadow: `0 2px 4px rgba(0,0,0,0.1)`

### Tables
- Row Height: 48px
- Header Background: Surface color
- Header Font Weight: 600
- Zebra Striping: Optional
- Row Hover: Light gray background
- Borders: 1px solid border color

### Forms

#### Input Fields
- Height: 40px
- Border: 1px solid border color
- Border Radius: 4px
- Padding: 8px 12px
- Focus: 2px solid primary color

#### Labels
- Font Size: Small (14px)
- Font Weight: 500
- Margin Bottom: 4px
- Color: Text secondary

#### Error State
- Border: Error color
- Helper Text: Error color
- Icon: Error icon in error color

### Charts
- Line Width: 2px
- Grid Lines: Light gray
- Axis Labels: Text secondary color
- Tooltip: White background, subtle shadow
- Colors: Use semantic colors for gains/losses

---

## Data Display Guidelines

### Currency Formatting
- Always use 2 decimal places: `$1,234.56`
- Negative values: `-$1,234.56` or `($1,234.56)`
- Large numbers: Use comma separators

### Percentage Formatting
- Always include % symbol: `15.23%`
- 2 decimal places for precision
- Color coding: Green for positive, red for negative

### Date Formatting
- Short: `01/15/2025`
- Medium: `Jan 15, 2025`
- Long: `January 15, 2025`
- Relative: `2 days ago` (for recent dates)

### Number Formatting
- Shares: Up to 6 decimal places
- Prices: Up to 6 decimal places
- Large numbers: Abbreviate (1.2M, 3.5B)

### Color Coding for Financial Data
- **Gains/Positive**: Green (`#2e7d32`)
- **Losses/Negative**: Red (`#d32f2f`)
- **Neutral/Zero**: Gray (`#757575`)
- Always provide a symbol (+/-) in addition to color

---

## Icons

### Icon Library
- Material Design Icons or Lucide Icons
- Size: 20px (small), 24px (default), 32px (large)
- Color: Match text color or use semantic colors

### Common Icons
- Dashboard: `<DashboardIcon />`
- Accounts: `<AccountBalanceIcon />`
- Transactions: `<ReceiptIcon />`
- Properties: `<HomeIcon />`
- Reports: `<AssessmentIcon />`
- Settings: `<SettingsIcon />`
- Add: `<AddIcon />`
- Edit: `<EditIcon />`
- Delete: `<DeleteIcon />`
- Upload: `<UploadIcon />`
- Download: `<DownloadIcon />`

---

## Navigation

### Top Navigation Bar
- Height: 64px
- Background: White (light mode) / Dark surface (dark mode)
- Logo: Left side
- Primary Navigation: Center
- User Menu: Right side
- Box Shadow: Subtle shadow for elevation

### Sidebar (Mobile)
- Width: 280px
- Overlay: Dark semi-transparent
- Animation: Slide in from left
- Close: Tap outside or close button

### Breadcrumbs
- Font Size: Small (14px)
- Separator: `/` or `>`
- Color: Text secondary
- Active: Text primary

---

## Responsive Design

### Mobile (< 600px)
- Single column layout
- Bottom tab navigation
- Hamburger menu for secondary navigation
- Touch-friendly targets (min 44px)
- Simplified tables (card view)

### Tablet (600px - 960px)
- 2-column layouts where appropriate
- Side drawer navigation
- Full tables with horizontal scroll

### Desktop (> 960px)
- Multi-column layouts
- Persistent sidebar navigation
- Full-featured tables
- Hover states

---

## Accessibility

### Keyboard Navigation
- Tab order follows logical flow
- Focus indicators: 2px solid primary color
- Skip links for main content
- Keyboard shortcuts for common actions

### Screen Readers
- Semantic HTML elements
- ARIA labels where needed
- Alt text for all images
- Descriptive link text

### Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Don't rely on color alone for meaning

### Focus States
- Visible focus indicator on all interactive elements
- Minimum 2px outline
- High contrast color

---

## Animation & Motion

### Transitions
- Duration: 150ms (fast), 300ms (normal), 500ms (slow)
- Easing: `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material easing)
- Properties: opacity, transform, background-color

### Loading States
- Skeleton screens for content loading
- Spinner for short operations
- Progress bar for long operations
- Optimistic UI updates where appropriate

### Micro-interactions
- Button: Scale down slightly on press
- Hover: Subtle background color change
- Success: Brief green checkmark animation
- Error: Shake animation

---

## Error Handling

### Error Messages
- Clear, user-friendly language
- Specific problem description
- Suggested solution
- Contact support option

### Form Validation
- Inline validation after blur
- Show error message below field
- Red border and error icon
- Prevent submission until fixed

### Empty States
- Helpful illustration
- Explanation of why empty
- Call-to-action button
- Helpful tips

---

## Dashboard Widgets

### Widget Card
- Border Radius: 8px
- Padding: 16px
- Box Shadow: Subtle elevation
- Header: Title + action button
- Body: Main content
- Footer: Optional additional info

### Widget Types
1. **Metric Card**: Large number + label + trend
2. **Chart Widget**: Title + chart + legend
3. **List Widget**: Title + scrollable list
4. **Table Widget**: Title + mini table
5. **Action Widget**: Title + quick actions

---

## Illustrations & Empty States

### Style
- Flat, minimal illustrations
- Brand color palette
- Friendly, approachable tone
- Consistent style across app

### Use Cases
- Empty transaction list
- No properties added
- Zero positions
- Error pages (404, 500)
- Onboarding screens

---

## Best Practices

1. **Consistency**: Use components from the design system
2. **Whitespace**: Don't be afraid of empty space
3. **Hierarchy**: Use size, weight, and color to create hierarchy
4. **Feedback**: Always provide feedback for user actions
5. **Performance**: Optimize images, lazy load content
6. **Testing**: Test on multiple devices and screen sizes
7. **Documentation**: Document any new patterns

---

## Tools & Resources

- **Design Tool**: Figma
- **Icon Library**: Material Design Icons
- **Font**: Google Fonts (Inter)
- **Color Tool**: https://material.io/color
- **Accessibility Checker**: WAVE, axe DevTools
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/

---

## Version History

- **v1.0** (Current): Initial design system
- Future versions will document changes and additions
