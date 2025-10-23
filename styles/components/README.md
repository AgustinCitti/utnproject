# Unified Button System Documentation

## Overview
This unified button system provides a consistent set of button styles and variations for the entire application. It includes multiple variants, sizes, states, and special button types to maintain UI consistency across all components.

## Base Button Class
All buttons use the `.btn` base class which provides:
- Consistent padding and spacing
- Smooth transitions
- Focus states for accessibility
- Disabled states
- Responsive design

## Button Variants

### Primary Buttons
- **Class**: `.btn-primary`
- **Use**: Main actions, primary CTAs
- **Style**: Gradient blue background with white text

### Secondary Buttons
- **Class**: `.btn-secondary`
- **Use**: Secondary actions, cancel buttons
- **Style**: Gray background with white text

### Success Buttons
- **Class**: `.btn-success`
- **Use**: Confirm actions, save operations
- **Style**: Green gradient background with white text

### Danger Buttons
- **Class**: `.btn-danger`
- **Use**: Delete actions, destructive operations
- **Style**: Red gradient background with white text

### Warning Buttons
- **Class**: `.btn-warning`
- **Use**: Caution actions, warnings
- **Style**: Yellow gradient background with dark text

### Info Buttons
- **Class**: `.btn-info`
- **Use**: Information actions, help buttons
- **Style**: Blue gradient background with white text

### Light Buttons
- **Class**: `.btn-light`
- **Use**: Subtle actions, secondary CTAs
- **Style**: Light background with dark text and border

### Dark Buttons
- **Class**: `.btn-dark`
- **Use**: High contrast actions
- **Style**: Dark background with white text

## Outline Variants
Outline buttons have transparent backgrounds with colored borders:
- `.btn-outline-primary`
- `.btn-outline-secondary`
- `.btn-outline-success`
- `.btn-outline-danger`
- `.btn-outline-warning`
- `.btn-outline-info`

## Button Sizes

### Small Buttons
```html
<button class="btn btn-primary btn-sm">Small Button</button>
```

### Regular Buttons (Default)
```html
<button class="btn btn-primary">Regular Button</button>
```

### Large Buttons
```html
<button class="btn btn-primary btn-lg">Large Button</button>
```

### Extra Large Buttons
```html
<button class="btn btn-primary btn-xl">Extra Large Button</button>
```

## Icon Buttons

### Regular Icon Buttons
```html
<button class="btn btn-icon btn-icon-primary">
    <i class="fas fa-plus"></i>
</button>
```

### Icon Button Sizes
- `.btn-icon` - Regular size (2.5rem)
- `.btn-icon.btn-sm` - Small size (2rem)
- `.btn-icon.btn-lg` - Large size (3rem)

### Icon Button Variants
- `.btn-icon-primary`
- `.btn-icon-secondary`
- `.btn-icon-success`
- `.btn-icon-danger`
- `.btn-icon-warning`
- `.btn-icon-info`

## Special Button Types

### Ghost Buttons
```html
<button class="btn btn-ghost">Ghost Button</button>
```
Transparent background with colored text, minimal styling.

### Floating Action Button
```html
<button class="btn btn-fab">
    <i class="fas fa-plus"></i>
</button>
```
Fixed position floating button for primary actions.

### Button Groups
```html
<div class="btn-group">
    <button class="btn btn-primary">First</button>
    <button class="btn btn-primary">Second</button>
    <button class="btn btn-primary">Third</button>
</div>
```

## Button States

### Loading State
```html
<button class="btn btn-primary btn-loading">Loading...</button>
```
Shows a spinning indicator and disables interaction.

### Disabled State
```html
<button class="btn btn-primary" disabled>Disabled Button</button>
```

### Ripple Effect
```html
<button class="btn btn-primary btn-ripple">Ripple Button</button>
```
Adds a ripple animation on click.

## Usage Examples

### Basic Usage
```html
<!-- Primary action -->
<button class="btn btn-primary">Save Changes</button>

<!-- Secondary action -->
<button class="btn btn-secondary">Cancel</button>

<!-- Success action -->
<button class="btn btn-success">Confirm</button>

<!-- Danger action -->
<button class="btn btn-danger">Delete</button>
```

### With Icons
```html
<button class="btn btn-primary">
    <i class="fas fa-save"></i>
    Save
</button>

<button class="btn btn-icon btn-icon-danger">
    <i class="fas fa-trash"></i>
</button>
```

### Different Sizes
```html
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Regular</button>
<button class="btn btn-primary btn-lg">Large</button>
```

### Outline Buttons
```html
<button class="btn btn-outline-primary">Outline Primary</button>
<button class="btn btn-outline-danger">Outline Danger</button>
```

## Accessibility Features

### Focus States
All buttons include proper focus indicators for keyboard navigation.

### High Contrast Support
Buttons automatically adapt to high contrast mode preferences.

### Reduced Motion Support
Animations are disabled for users who prefer reduced motion.

### Screen Reader Support
Buttons include proper ARIA attributes and semantic HTML.

## Responsive Design

### Mobile Optimizations
- Smaller padding on mobile devices
- Touch-friendly button sizes
- Optimized spacing for mobile interactions

### Breakpoints
- Desktop: Full button styles
- Tablet: Slightly reduced padding
- Mobile: Compact button styles

## Browser Support

### Modern Browsers
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Fallbacks
- Graceful degradation for older browsers
- Progressive enhancement for modern features

## Customization

### CSS Custom Properties
You can customize the button system by overriding CSS custom properties:

```css
:root {
    --btn-primary-bg: #your-color;
    --btn-primary-hover: #your-hover-color;
    --btn-border-radius: 8px;
    --btn-padding: 0.75rem 1.5rem;
}
```

### Theme Integration
The button system integrates with your existing color scheme and can be easily themed.

## Best Practices

### Do's
- Use primary buttons for main actions
- Use secondary buttons for alternative actions
- Use danger buttons for destructive actions
- Include icons for better UX
- Maintain consistent button hierarchy

### Don'ts
- Don't use too many button variants on one page
- Don't use danger buttons for non-destructive actions
- Don't make buttons too small for touch devices
- Don't forget to include loading states for async actions

## Migration Guide

### From Old Button Classes
Replace old button classes with the new unified system:

```html
<!-- Old -->
<button class="btn-primary">Old Button</button>

<!-- New -->
<button class="btn btn-primary">New Button</button>
```

### Gradual Migration
You can migrate buttons gradually by updating one component at a time.

## Performance Considerations

### CSS Optimization
- Minimal CSS footprint
- Efficient selectors
- Optimized animations

### Bundle Size
The button system adds approximately 8KB to your CSS bundle.

## Testing

### Visual Testing
- Test all button variants
- Test different screen sizes
- Test with different themes
- Test accessibility features

### Functional Testing
- Test button interactions
- Test keyboard navigation
- Test screen reader compatibility
- Test touch interactions on mobile

## Support

For questions or issues with the button system, please refer to the main documentation or contact the development team.
