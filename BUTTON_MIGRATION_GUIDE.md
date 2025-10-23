# Button System Migration Guide

## Overview
This guide helps you migrate from the old button styles to the new unified button system.

## Quick Migration Reference

### Basic Button Migration

#### Old → New
```html
<!-- OLD -->
<button class="btn-primary">Save</button>
<button class="btn-secondary">Cancel</button>

<!-- NEW -->
<button class="btn btn-primary">Save</button>
<button class="btn btn-secondary">Cancel</button>
```

### Icon Button Migration

#### Old → New
```html
<!-- OLD -->
<button class="btn-icon">
    <i class="fas fa-plus"></i>
</button>

<!-- NEW -->
<button class="btn btn-icon btn-icon-primary">
    <i class="fas fa-plus"></i>
</button>
```

### Modern Button Migration

#### Old → New
```html
<!-- OLD -->
<button class="btn-modern">Modern Button</button>

<!-- NEW -->
<button class="btn btn-primary">Modern Button</button>
```

## Detailed Migration Examples

### 1. Report Actions
```html
<!-- OLD -->
<div class="report-actions">
    <button class="btn-primary">Export</button>
    <button class="btn-secondary">Print</button>
</div>

<!-- NEW -->
<div class="report-actions">
    <button class="btn btn-primary">Export</button>
    <button class="btn btn-secondary">Print</button>
</div>
```

### 2. Notification Actions
```html
<!-- OLD -->
<div class="notification-actions">
    <button class="btn-icon">View</button>
    <button class="btn-icon btn-delete">Delete</button>
</div>

<!-- NEW -->
<div class="notification-actions">
    <button class="btn btn-icon btn-icon-primary">View</button>
    <button class="btn btn-icon btn-icon-danger">Delete</button>
</div>
```

### 3. Form Actions
```html
<!-- OLD -->
<div class="form-actions">
    <button class="btn-primary">Save</button>
    <button class="btn-secondary">Cancel</button>
</div>

<!-- NEW -->
<div class="form-actions">
    <button class="btn btn-primary">Save</button>
    <button class="btn btn-secondary">Cancel</button>
</div>
```

### 4. Table Actions
```html
<!-- OLD -->
<div class="table-actions">
    <button class="btn-icon btn-view">View</button>
    <button class="btn-icon btn-edit">Edit</button>
    <button class="btn-icon btn-delete">Delete</button>
</div>

<!-- NEW -->
<div class="table-actions">
    <button class="btn btn-icon btn-icon-info">View</button>
    <button class="btn btn-icon btn-icon-warning">Edit</button>
    <button class="btn btn-icon btn-icon-danger">Delete</button>
</div>
```

## Button Variant Mapping

### Color Variants
| Old Class | New Class | Use Case |
|-----------|-----------|----------|
| `btn-primary` | `btn btn-primary` | Primary actions |
| `btn-secondary` | `btn btn-secondary` | Secondary actions |
| N/A | `btn btn-success` | Success/confirm actions |
| N/A | `btn btn-danger` | Delete/destructive actions |
| N/A | `btn btn-warning` | Warning actions |
| N/A | `btn btn-info` | Information actions |

### Size Variants
| Old Class | New Class | Description |
|-----------|-----------|-------------|
| N/A | `btn btn-sm` | Small buttons |
| Default | `btn` (default) | Regular buttons |
| N/A | `btn btn-lg` | Large buttons |
| N/A | `btn btn-xl` | Extra large buttons |

### Icon Button Variants
| Old Class | New Class | Description |
|-----------|-----------|-------------|
| `btn-icon` | `btn btn-icon btn-icon-primary` | Primary icon button |
| `btn-icon btn-delete` | `btn btn-icon btn-icon-danger` | Danger icon button |
| N/A | `btn btn-icon btn-icon-success` | Success icon button |
| N/A | `btn btn-icon btn-icon-warning` | Warning icon button |
| N/A | `btn btn-icon btn-icon-info` | Info icon button |

## Special Cases

### Floating Action Button
```html
<!-- OLD -->
<button class="btn-fab">
    <i class="fas fa-plus"></i>
</button>

<!-- NEW -->
<button class="btn btn-fab">
    <i class="fas fa-plus"></i>
</button>
```

### Button Groups
```html
<!-- OLD -->
<div class="btn-group">
    <button class="btn-primary">First</button>
    <button class="btn-primary">Second</button>
</div>

<!-- NEW -->
<div class="btn-group">
    <button class="btn btn-primary">First</button>
    <button class="btn btn-primary">Second</button>
</div>
```

### Outline Buttons
```html
<!-- NEW (not available in old system) -->
<button class="btn btn-outline-primary">Outline Primary</button>
<button class="btn btn-outline-danger">Outline Danger</button>
```

## Migration Checklist

### Phase 1: Update HTML Classes
- [ ] Replace `btn-primary` with `btn btn-primary`
- [ ] Replace `btn-secondary` with `btn btn-secondary`
- [ ] Update icon buttons to use `btn btn-icon btn-icon-*`
- [ ] Update modern buttons to use `btn btn-primary`

### Phase 2: Test Functionality
- [ ] Test all button interactions
- [ ] Verify hover states
- [ ] Check focus states
- [ ] Test disabled states
- [ ] Verify responsive behavior

### Phase 3: Update JavaScript
- [ ] Update any JavaScript that targets old button classes
- [ ] Test button event handlers
- [ ] Verify loading states work correctly

### Phase 4: Clean Up
- [ ] Remove old button CSS (already done)
- [ ] Update documentation
- [ ] Test across all browsers
- [ ] Verify accessibility features

## Common Issues and Solutions

### Issue: Buttons look different
**Solution**: Make sure you're using both `btn` and the variant class (e.g., `btn btn-primary`)

### Issue: Icon buttons not working
**Solution**: Use the new icon button classes: `btn btn-icon btn-icon-primary`

### Issue: Hover effects not working
**Solution**: The new system has different hover effects. Check if they meet your design requirements.

### Issue: Size differences
**Solution**: Use the new size classes: `btn-sm`, `btn-lg`, `btn-xl`

## Testing Your Migration

### Visual Testing
1. Check all button variants
2. Test different sizes
3. Verify hover states
4. Check focus states
5. Test disabled states

### Functional Testing
1. Test all button clicks
2. Verify form submissions
3. Test keyboard navigation
4. Check screen reader compatibility

### Responsive Testing
1. Test on mobile devices
2. Check tablet layouts
3. Verify desktop behavior
4. Test touch interactions

## Rollback Plan

If you need to rollback the changes:

1. Remove the import from `app.css`:
   ```css
   /* Remove this line */
   @import url('./components/buttons.css');
   ```

2. Restore the old button styles (if needed)

3. Update HTML to use old classes

## Support

If you encounter issues during migration:

1. Check the button system documentation
2. Verify you're using the correct class combinations
3. Test in a clean environment
4. Contact the development team for assistance

## Benefits of the New System

- **Consistency**: All buttons follow the same design patterns
- **Accessibility**: Better focus states and keyboard navigation
- **Maintainability**: Centralized button styles
- **Flexibility**: More button variants and sizes
- **Performance**: Optimized CSS with better browser support
- **Responsive**: Better mobile and tablet support
