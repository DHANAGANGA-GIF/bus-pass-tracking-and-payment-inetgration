# UI Wireframes

## Overview
This document describes the wireframes for the Bus Pass Booking Platform. The platform consists of three portals:
1. User Portal (for passengers)
2. Admin Portal (for transport administrators)
3. Super Admin Portal (for system administrators)

Each portal is built as a separate Next.js application (apps/web, apps/admin, apps/super-admin) but shares common UI components from the shared UI package.

## Common Layout
All pages share a common layout consisting of:
- **Header**: Contains logo, navigation links, user profile dropdown, and notifications icon.
- **Sidebar** (for dashboards): Collapsible sidebar with navigation menu items.
- **Footer**: Contains copyright information and links.

### Header
```
+---------------------------------------------------------------+
| [Logo]          Home  Routes  Book Pass  My Passes  Help     |
|                                                              |
|                                                                 [Bell Icon] [User Avatar] [Dropdown]                 |
+---------------------------------------------------------------+
```

### Sidebar (for authenticated dashboards)
```
+------------------+---------------------------------------------+
|  Dashboard       |                                             |
|  Profile         |                                             |
|  My Passes       |                                             |
|  Booking History |                                             |
|  Wallet          |                                             |
|  Settings        |                                             |
|  Logout          |                                             |
|                  |                                             |
|                  |                    Main Content             |
|                  |                                             |
|                  |                                             |
|                  |                                             |
|                  |                                             |
+------------------+---------------------------------------------+
```

## User Portal Pages

### 1. Landing Page (Public)
- Hero section with tagline, call-to-action buttons (Login, Register)
- Features section highlighting key benefits
- How it works section (simple steps)
- Testimonials
- FAQ
- Footer

### 2. Login Page
- Form with email/username and password
- "Remember me" checkbox
- "Forgot password?" link
- Social login buttons (Google)
- Sign up link for new users

### 3. Register Page
- Form with full name, email, phone, password, confirm password
- Terms and conditions checkbox
- Sign in link for existing users
- Optional: Social login buttons

### 4. User Dashboard (Authenticated)
- Overview cards: Active Pass, Upcoming Trips, Wallet Balance, Notifications
- Quick actions: Renew Pass, Book New Pass, View Pass
- Recent activity section
- Profile shortcut

### 5. Book Pass Page
- Stepper for multi-step process:
  1. Select Route (from/to, date)
  2. Select Bus & Schedule (showing available seats, timing, price)
  3. Select Pass Type (Daily, Weekly, Monthly, etc.) and quantity
  4. Review & Pay (summary, payment methods)
- Date picker, time slots
- Seat selection (if applicable)
- Fare breakdown
- Payment method selection (Credit/Debit Card, UPI, Net Banking, Wallet)
- Apply coupon/promo code field
- Place order button

### 6. Pass Detail / My Passes
- List of active and expired passes
- Each pass card shows: pass type, validity period, QR code, status (Active/Expired/Used)
- Actions: Renew, Download PDF, Share, Verify (for scanning by others)
- QR code displayed prominently for active passes

### 7. Booking History
- Table/list of past bookings with filters (date range, status)
- Each entry shows: booking ID, date, route, pass type, amount, status
- Actions: View details, Download invoice/receipt, Cancel (if eligible), Refund request

### 8. Profile Settings
- Personal information form (name, email, phone)
- Change password form
- Connected accounts (Google)
- Device management (active sessions)
- Privacy settings
- Delete account option

### 9. Wallet / Payments
- Add money to wallet
- Transaction history
- Payment methods saved
- Bank/UPI details

### 10. Help & Support
- FAQ
- Contact form
- Live chat (if integrated)
- Support email/phone

## Admin Portal Pages

### 1. Admin Dashboard (Authenticated Admin)
- Overview cards: Total Users, Active Passes, Today's Bookings, Revenue Today
- Charts: Daily/weekly/monthly bookings, revenue trend
- Recent activities
- Quick actions: Manage Users, Manage Routes, View Reports

### 2. User Management
- Searchable and filterable user list
- User details view (roles, status, activity)
- Actions: Activate/Deactivate, Reset Password, Assign Role, View Profile

### 3. Route Management
- List of routes with source, destination, distance, base fare
- Add/edit route form
- Assign buses to routes
- Set schedules for routes

### 4. Bus & Schedule Management
- List of buses with license plate, model, capacity
- Add/edit bus form
- Schedule management (trips, timing, availability)
- Assign buses to schedules

### 5. Booking Management
- List of all bookings with filters (status, date range, user)
- Booking details view
- Actions: Confirm, Cancel, Refund, Resend Ticket

### 6. Payment Management
- List of transactions with filters
- Payment gateway settings
- Refund requests management

### 7. Reports & Analytics
- Pre-built reports: Daily sales, revenue by route, peak hours, user growth
- Custom report builder
- Export options (PDF, CSV, Excel)

### 8. Settings
- General settings (app name, contact info, timezone)
- Payment gateway configuration
- Email/SMS template management
- Notification settings
- Security settings (password policy, session timeout)

## Super Admin Portal Pages
(Similar to Admin but with additional capabilities)

### 1. System Dashboard
- Overview of all metrics across all tenants/regions
- System health monitors
- Admin activity log

### 2. Manage Admins
- Create/admin admin users
- Assign permissions/roles
- View audit logs

### 3. Manage System Settings
- Global configuration settings
- Feature flags
- Integrations (payment gateways, email/SMS providers)

### 4. Logs & Monitoring
- System error logs
- Performance metrics
- API usage statistics

## Common Components

### Header
- Logo on left
- Navigation links (contextual)
- Right side: Notifications bell (with badge), User avatar with dropdown for profile, settings, logout)

### Sidebar
- Collapsible menu with icons
- Active item highlighted
- Can be hidden on mobile

### Footer
- Copyright
- Links: About, Terms, Privacy, Contact
- Social media icons

### Cards
- Used for displaying information in boxes
- Header, body, footer variants

### Buttons
- Primary, secondary, danger, outline variants
- Loading and disabled states

### Forms
- Input fields with labels, placeholders, validation messages
- Select dropdowns, checkboxes, radio buttons
- Date/time pickers
- File uploaders

### Tables
- Sortable columns
- Pagination
- Row selection
- Bulk actions

### Modals
- For forms, confirmations, detailed views

### Toasts/Notifications
- Non-intrusive messages at top-right or bottom-right

### Loading Indicators
- Spinners, skeleton screens

### Empty States
- Illustrative graphics with message when no data

## Mobile Responsiveness
- All pages responsive
- Sidebar converts to bottom navigation or collapsible menu on mobile
- Cards stack vertically
- Modals become full-screen or bottom sheets

## Accessibility
- ARIA labels
- Keyboard navigation
- Sufficient color contrast
- Screen reader friendly

## Theme
- Light and dark mode support
- Primary color: Blue (trust, reliability)
- Secondary color: Green (success, go)
- Error color: Red
- Warning color: Amber
- Info color: Cyan

## Note
The actual UI components will be built using ShadCN UI and Tailwind CSS for consistency and rapid development.