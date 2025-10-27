# Unified Button System Guide

This guide explains how to use the comprehensive button system in the UTN Project application. All button styles are centralized in `styles/components/buttons.css` to ensure UI consistency across all pages.

## Table of Contents
- [Basic Button Classes](#basic-button-classes)
- [Button Sizes](#button-sizes)
- [Button Variants](#button-variants)
- [Specialized Button Types](#specialized-button-types)
- [Button States](#button-states)
- [Button Groups](#button-groups)
- [Accessibility Features](#accessibility-features)
- [Usage Examples](#usage-examples)

## Basic Button Classes

### `.btn` - Base Button Class
All buttons should use the `.btn` class as the foundation:

```html
<button class="btn">Basic Button</button>
<a href="#" class="btn">Button Link</a>
```

**Features:**
- Consistent padding, border-radius, and typography
- Smooth transitions and hover effects
- Focus states for accessibility
- Disabled state support

## Button Sizes

### Size Modifiers
- `.btn-sm` - Small button (0.5rem 1rem padding)
- `.btn-lg` - Large button (1rem 2rem padding)  
- `.btn-xl` - Extra large button (1.25rem 2.5rem padding)

```html
<button class="btn btn-sm">Small</button>
<button class="btn">Default</button>
<button class="btn btn-lg">Large</button>
<button class="btn btn-xl">Extra Large</button>
```

## Button Variants

### Primary Colors
- `.btn-primary` - Main action button (gradient blue-purple)
- `.btn-secondary` - Secondary action (gray)
- `.btn-success` - Success/positive action (green gradient)
- `.btn-danger` - Danger/destructive action (red gradient)
- `.btn-warning` - Warning action (yellow-orange gradient)
- `.btn-info` - Information action (blue-purple gradient)
- `.btn-light` - Light background (white/gray)
- `.btn-dark` - Dark background (dark gray)

### Outline Variants
- `.btn-outline-primary`
- `.btn-outline-secondary`
- `.btn-outline-success`
- `.btn-outline-danger`
- `.btn-outline-warning`
- `.btn-outline-info`

```html
<button class="btn btn-primary">Primary Action</button>
<button class="btn btn-outline-primary">Outline Primary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Delete</button>
```

## Specialized Button Types

### Icon Buttons
- `.btn-icon` - Circular icon-only button
- `.btn-icon-primary`, `.btn-icon-secondary`, etc. - Colored variants

```html
<button class="btn-icon btn-icon-primary">
    <i class="fas fa-plus"></i>
</button>
```

### Tab Navigation
- `.tab-btn` - Tab navigation button
- `.tab-btn.active` - Active tab state

```html
<div class="tab-navigation">
    <button class="tab-btn active">Tab 1</button>
    <button class="tab-btn">Tab 2</button>
</div>
```

### View Toggle Buttons
- `.view-btn` - Grid/list view toggle
- `.view-btn.active` - Active view state

```html
<div class="view-toggle">
    <button class="view-btn active" data-view="list">
        <i class="fas fa-list"></i>
    </button>
    <button class="view-btn" data-view="grid">
        <i class="fas fa-th"></i>
    </button>
</div>
```

### Navigation Buttons
- `.language-toggle` - Language switcher
- `.logout-btn` - Logout button
- `.menu-toggle` - Mobile menu toggle
- `.close-nav` - Close navigation
- `.close-modal` - Close modal dialog

```html
<button class="language-toggle">
    <i class="fas fa-globe"></i>
    <span>EN</span>
</button>

<button class="logout-btn">
    <i class="fas fa-sign-out-alt"></i>
    Logout
</button>
```

### Action Buttons
- `.action-btn` - General action button with gradient
- `.filter-btn` - Filter/selection button
- `.status-btn` - Status indicator button

```html
<button class="action-btn">
    <i class="fas fa-plus"></i>
    Add Item
</button>

<button class="filter-btn active">All</button>
<button class="filter-btn">Active</button>

<button class="status-btn status-active">Active</button>
<button class="status-btn status-inactive">Inactive</button>
```

### Toggle Switch
- `.toggle-btn` - Toggle switch button
- `.toggle-btn.active` - Active toggle state

```html
<button class="toggle-btn"></button>
<button class="toggle-btn active"></button>
```

### Breadcrumb Navigation
- `.breadcrumb-btn` - Breadcrumb navigation button
- `.breadcrumb-btn.active` - Current page indicator

```html
<nav class="breadcrumb">
    <button class="breadcrumb-btn">Home</button>
    <button class="breadcrumb-btn">Section</button>
    <button class="breadcrumb-btn active">Current Page</button>
</nav>
```

## Button States

### Loading State
- `.btn-loading` - Shows loading spinner

```html
<button class="btn btn-primary btn-loading">Loading...</button>
```

### Disabled State
- `:disabled` - Disabled button state

```html
<button class="btn btn-primary" disabled>Disabled Button</button>
```

### Ripple Effect
- `.btn-ripple` - Adds ripple effect on click

```html
<button class="btn btn-primary btn-ripple">Ripple Effect</button>
```

## Button Groups

### Horizontal Button Group
- `.btn-group` - Groups buttons together

```html
<div class="btn-group">
    <button class="btn btn-primary">Left</button>
    <button class="btn btn-primary">Middle</button>
    <button class="btn btn-primary">Right</button>
</div>
```

## Floating Action Button

### FAB (Floating Action Button)
- `.btn-fab` - Fixed position floating button

```html
<button class="btn-fab">
    <i class="fas fa-plus"></i>
</button>
```

## Accessibility Features

### Focus States
All buttons include proper focus indicators for keyboard navigation:

```css
.btn:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
}
```

### High Contrast Support
Buttons automatically adapt to high contrast mode:

```css
@media (prefers-contrast: high) {
    .btn {
        border: 2px solid currentColor;
    }
}
```

### Reduced Motion Support
Animations are disabled for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
    .btn {
        transition: none;
    }
}
```

## Usage Examples

### Complete Button Examples

```html
<!-- Primary action button -->
<button class="btn btn-primary btn-lg">
    <i class="fas fa-save"></i>
    Save Changes
</button>

<!-- Secondary action with outline -->
<button class="btn btn-outline-secondary">
    Cancel
</button>

<!-- Danger action -->
<button class="btn btn-danger btn-sm">
    <i class="fas fa-trash"></i>
    Delete
</button>

<!-- Icon button -->
<button class="btn-icon btn-icon-primary">
    <i class="fas fa-edit"></i>
</button>

<!-- Tab navigation -->
<div class="tab-navigation">
    <button class="tab-btn active" data-tab="overview">
        <i class="fas fa-chart-line"></i>
        Overview
    </button>
    <button class="tab-btn" data-tab="details">
        <i class="fas fa-info-circle"></i>
        Details
    </button>
</div>

<!-- View toggle -->
<div class="view-toggle">
    <button class="view-btn active" data-view="list">
        <i class="fas fa-list"></i>
    </button>
    <button class="view-btn" data-view="grid">
        <i class="fas fa-th"></i>
    </button>
</div>

<!-- Button group -->
<div class="btn-group">
    <button class="btn btn-primary">Previous</button>
    <button class="btn btn-primary">Next</button>
</div>

<!-- Floating action button -->
<button class="btn-fab">
    <i class="fas fa-plus"></i>
</button>
```

## Best Practices

1. **Always use the base `.btn` class** for consistency
2. **Combine size and variant classes** as needed
3. **Use semantic button variants** (success for positive actions, danger for destructive actions)
4. **Include icons** for better visual communication
5. **Test keyboard navigation** and focus states
6. **Use appropriate button types** for different contexts
7. **Maintain consistent spacing** and alignment

## Browser Support

The button system supports:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Internet Explorer 11+ (with graceful degradation)
- Mobile browsers (iOS Safari, Chrome Mobile)
- High contrast mode
- Reduced motion preferences
- Print media

## Customization

To customize button colors or styles, modify the CSS custom properties in `styles/components/buttons.css`. The system uses CSS variables for easy theming and customization.
