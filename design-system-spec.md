# TriageCare Design System Specifications

This document outlines the design foundation and provides standard HTML/CSS code snippets for components in **TriageCare**. 

Import this system into any HTML/web project by including the stylesheet:
```html
<link rel="stylesheet" href="design-system.css">
```

---

## 1. Foundation & Design Tokens

### Colors
| Name | Hex / Value | CSS Variable | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Blue** | `#2563EB` | `--tc-color-primary` | Main buttons, active links, branding |
| **Primary Hover** | `#1D4ED8` | `--tc-color-primary-hover` | Buttons hover |
| **Primary Soft** | `#EFF6FF` | `--tc-color-primary-soft` | Active states background, soft badges |
| **Soft White Background**| `#F8FAFC` | `--tc-color-bg` | Main app window background |
| **Surface (Card/Panel)**| `#FFFFFF` | `--tc-color-surface` | Default background for content blocks |
| **Text Main** | `#0F172A` | `--tc-color-text-main` | Headings, titles, emphasis |
| **Text Secondary** | `#475569` | `--tc-color-text-secondary` | Body copy, labels, details |
| **Text Muted** | `#64748B` | `--tc-color-text-muted` | Placeholders, inactive items, timestamps |
| **Border Slate** | `#E2E8F0` | `--tc-color-border` | Default lines, card outlines |
| **Divider Light** | `#F1F5F9` | `--tc-color-divider` | Subtle rows separators, sections |

### Typography
We use **Inter** as the primary font family.
- **Weights**: Regular (`400`), Medium (`500`), SemiBold (`600`), Bold (`700`)
- **Sizes**:
  - `h1`: `2.25rem` (36px) — Page titles
  - `h2`: `1.875rem` (30px) — Panel headers
  - `h3`: `1.5rem` (24px) — Modal headers
  - `h4`: `1.25rem` (20px) — Large cards
  - `h5`: `1.125rem` (18px) — Card titles
  - `h6` / Base: `1rem` (16px) — Base text
  - Small (`.tc-text-sm`): `0.875rem` (14px) — Table items, sidebar labels
  - Extra Small (`.tc-text-xs`): `0.75rem` (12px) — Badges, input helper text

### Border Radius & Shadows
- **Cards & Outer Container Radius**: `20px` (`--tc-radius-xl`)
- **Buttons & Inputs Radius**: `10px` (`--tc-radius-md`)
- **Soft Shadow (Premium elevation)**: `--tc-shadow-lg`

---

## 2. Component Snippets

### A. Sidebar Style
Ideal for a vertical sidebar layout. Set active items with `.tc-sidebar-item-active`.

```html
<aside class="tc-sidebar-container">
  <div class="tc-sidebar-header">
    <div class="tc-logo">T</div>
    <span class="tc-brand-name">TriageCare</span>
  </div>
  
  <nav class="tc-sidebar-nav">
    <span class="tc-sidebar-nav-label">Main Menu</span>
    
    <a href="#" class="tc-sidebar-item tc-sidebar-item-active">
      <div class="tc-sidebar-item-content">
        <!-- SVG icon goes here -->
        <svg class="tc-sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        <span>Dashboard</span>
      </div>
    </a>
    
    <a href="#" class="tc-sidebar-item">
      <div class="tc-sidebar-item-content">
        <svg class="tc-sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        <span>Patients</span>
      </div>
    </a >
    
    <a href="#" class="tc-sidebar-item">
      <div class="tc-sidebar-item-content">
        <svg class="tc-sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <span>Appointments</span>
      </div>
    </a>

    <span class="tc-sidebar-nav-label">System</span>
    <a href="#" class="tc-sidebar-item">
      <div class="tc-sidebar-item-content">
        <svg class="tc-sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        <span>Settings</span>
      </div>
    </a>
  </nav>
  
  <div class="tc-sidebar-footer">
    <div class="tc-table-avatar">Dr</div>
    <div class="tc-user-profile">
      <span class="tc-user-name">Dr. Sarah Cole</span>
      <span class="tc-user-role">Triage Supervisor</span>
    </div>
  </div>
</aside>
```

### B. Button Styles
Include primary, secondary, outline, and ghost variants.

```html
<!-- Primary (High Emphasis) -->
<button class="tc-btn tc-btn-primary">
  <span>Admit Patient</span>
</button>

<!-- Secondary (Standard UI Actions) -->
<button class="tc-btn tc-btn-secondary">
  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
  <span>Filters</span>
</button>

<!-- Outline (Alt Actions) -->
<button class="tc-btn tc-btn-outline">
  <span>Export PDF</span>
</button>

<!-- Ghost (Low Emphasis) -->
<button class="tc-btn tc-btn-ghost">
  <span>Cancel</span>
</button>

<!-- Small and Large sizes -->
<button class="tc-btn tc-btn-primary tc-btn-sm">Small Btn</button>
<button class="tc-btn tc-btn-primary tc-btn-lg">Large Action</button>
```

### C. Input Fields
Always wrap inputs in `.tc-input-wrapper` for optimal spacing and form labels.

```html
<!-- Text Input (Default) -->
<div class="tc-input-wrapper">
  <label class="tc-label" for="patient-name">Patient Name</label>
  <input type="text" id="patient-name" class="tc-input" placeholder="e.g. John Doe">
</div>

<!-- Input with Icon -->
<div class="tc-input-wrapper">
  <label class="tc-label" for="search-patient">Search Patient Record</label>
  <div class="tc-input-field-container tc-input-has-leading-icon">
    <div class="tc-input-icon tc-input-icon-leading">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
    </div>
    <input type="text" id="search-patient" class="tc-input" placeholder="Enter ID or name...">
  </div>
</div>

<!-- Input with Error Validation State -->
<div class="tc-input-wrapper tc-input-error">
  <label class="tc-label" for="email">Email Address</label>
  <input type="email" id="email" class="tc-input" value="invalid-email" placeholder="you@domain.com">
  <span class="tc-input-error-msg">Please enter a valid email address</span>
</div>
```

### D. Card Components
Cards feature a standard border radius of `20px`. The `.tc-card-hover` class applies a premium micro-translation on hover.

```html
<!-- Simple Static Card -->
<div class="tc-card">
  <div class="tc-card-header">
    <h5 class="tc-card-title">Heart Rate</h5>
    <span class="tc-badge tc-badge-success">Normal</span>
  </div>
  <div class="tc-card-body">
    <p class="tc-text-main tc-text-semibold" style="font-size: 2rem; margin-bottom: 4px;">72 BPM</p>
    <span class="tc-text-muted tc-text-xs">Measured 2 mins ago</span>
  </div>
</div>

<!-- Hover Interactive Card -->
<div class="tc-card tc-card-hover">
  <div class="tc-card-header">
    <h5 class="tc-card-title">Patient Queue</h5>
  </div>
  <div class="tc-card-body">
    <p>View current emergency room queue and triage statuses.</p>
  </div>
  <div class="tc-card-footer">
    <button class="tc-btn tc-btn-secondary tc-btn-sm">View Queue</button>
  </div>
</div>

<!-- Glassmorphism Card (Recommended for floating overlays/subtle items) -->
<div class="tc-card tc-card-glass">
  <h5 class="tc-card-title">Telemetry Stream</h5>
  <p>Real-time vital analytics loading...</p>
</div>
```

### E. Tables
Encapsulate your table inside `.tc-table-wrapper` and `.tc-table-container` to maintain borders, rounded corners (`20px`), and support responsiveness.

```html
<div class="tc-table-wrapper">
  <div class="tc-table-container">
    <table class="tc-table">
      <thead>
        <tr>
          <th>Patient</th>
          <th>Triage Category</th>
          <th>Admitted</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="tc-table-cell-profile">
              <div class="tc-table-avatar">JD</div>
              <div>
                <div class="tc-text-main tc-text-semibold">John Doe</div>
                <div class="tc-text-muted tc-text-xs">ID: #4092</div>
              </div>
            </div>
          </td>
          <td>
            <span class="tc-badge tc-badge-danger">Urgent (L1)</span>
          </td>
          <td>10:42 AM</td>
          <td>
            <span class="tc-badge-dot tc-badge-dot-success tc-text-xs">Stable</span>
          </td>
          <td>
            <button class="tc-btn tc-btn-ghost tc-btn-sm tc-btn-icon-only">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </td>
        </tr>
        <tr>
          <td>
            <div class="tc-table-cell-profile">
              <div class="tc-table-avatar">AS</div>
              <div>
                <div class="tc-text-main tc-text-semibold">Alice Smith</div>
                <div class="tc-text-muted tc-text-xs">ID: #8112</div>
              </div>
            </div>
          </td>
          <td>
            <span class="tc-badge tc-badge-warning">Delayed (L3)</span>
          </td>
          <td>11:05 AM</td>
          <td>
            <span class="tc-badge-dot tc-badge-dot-warning tc-text-xs">Pending Review</span>
          </td>
          <td>
            <button class="tc-btn tc-btn-ghost tc-btn-sm tc-btn-icon-only">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### F. Badge Styles
Provides options for alert indicators (pill design) and bullet-point dot statuses.

```html
<!-- Colored Capsule Badges -->
<span class="tc-badge tc-badge-primary">Admission</span>
<span class="tc-badge tc-badge-success">Stable</span>
<span class="tc-badge tc-badge-warning">Monitoring</span>
<span class="tc-badge tc-badge-danger">Critical</span>
<span class="tc-badge tc-badge-neutral">Archived</span>

<!-- Bullet Dot Indicators -->
<span class="tc-badge-dot tc-badge-dot-primary">Selected</span>
<span class="tc-badge-dot tc-badge-dot-success">Online</span>
<span class="tc-badge-dot tc-badge-dot-warning">Warning</span>
<span class="tc-badge-dot tc-badge-dot-danger">Critical Alert</span>
<span class="tc-badge-dot tc-badge-dot-neutral">Offline</span>
```

---

## 3. Customizations & Dark Mode Support

### Micro-Animations
- **Hover Lift**: Apply `.tc-hover-lift` to cards or widgets to make them float up on hover.
- **Scale Press**: Apply `.tc-hover-scale` to icons or miniature buttons for tactile spring feedback.
- **Loading Skeleton**: Use `.tc-skeleton` on mock-elements during asynchronous loading phases.

### Toggling Dark Theme
The design system includes automatic variables that adapt to a dark environment when a `data-theme="dark"` attribute is present on the root `<html>` or `<body>` element.
```javascript
// Toggle Theme function
document.documentElement.setAttribute('data-theme', 'dark');  // Switch to Dark Theme
document.documentElement.removeAttribute('data-theme');       // Switch to Light Theme
```
