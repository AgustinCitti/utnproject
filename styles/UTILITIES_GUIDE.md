# Utility CSS Library - Usage Guide

This document explains how to use the utility CSS classes that have been created to replace component-specific styles.

## Overview

The utility CSS library provides reusable classes for common styling patterns, similar to Tailwind CSS. This allows you to style components directly in HTML without writing custom CSS for each component.

## Import

The utilities are automatically imported in `app.css`:
```css
@import url('./utilities.css');
```

## Spacing Utilities

### Padding
- `p-0` to `p-12` - Padding on all sides
- `px-0` to `px-8` - Horizontal padding
- `py-0` to `py-8` - Vertical padding
- `pt-*`, `pr-*`, `pb-*`, `pl-*` - Individual side padding

**Example:**
```html
<div class="p-4">Padding 1rem on all sides</div>
<div class="px-6 py-4">Padding 1.5rem horizontal, 1rem vertical</div>
```

### Margin
- `m-0` to `m-8` - Margin on all sides
- `mx-auto` - Center horizontally
- `my-*` - Vertical margin
- `mt-*`, `mr-*`, `mb-*`, `ml-*` - Individual side margin

**Example:**
```html
<div class="mb-4">Margin bottom 1rem</div>
<div class="mx-auto">Centered horizontally</div>
```

## Display Utilities

- `d-none` - display: none
- `d-block` - display: block
- `d-flex` - display: flex
- `d-grid` - display: grid
- `d-inline` - display: inline
- `d-inline-block` - display: inline-block

**Example:**
```html
<div class="d-flex">Flex container</div>
<div class="d-grid">Grid container</div>
```

## Flexbox Utilities

### Direction
- `flex-row` - flex-direction: row
- `flex-column` - flex-direction: column

### Justify Content
- `justify-start` - justify-content: flex-start
- `justify-end` - justify-content: flex-end
- `justify-center` - justify-content: center
- `justify-between` - justify-content: space-between
- `justify-around` - justify-content: space-around

### Align Items
- `items-start` - align-items: flex-start
- `items-end` - align-items: flex-end
- `items-center` - align-items: center
- `items-baseline` - align-items: baseline

### Gap
- `gap-0` to `gap-8` - Gap between flex items

**Example:**
```html
<div class="d-flex justify-between items-center gap-4">
  <span>Left</span>
  <span>Right</span>
</div>
```

## Grid Utilities

### Grid Columns
- `grid-cols-1` to `grid-cols-4` - Fixed column grids
- `grid-cols-auto` - Auto-fill grid (minmax(300px, 1fr))

### Grid Gap
- `grid-gap-0` to `grid-gap-8` - Gap between grid items

**Example:**
```html
<div class="d-grid grid-cols-3 grid-gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Typography Utilities

### Text Alignment
- `text-left` - text-align: left
- `text-center` - text-align: center
- `text-right` - text-align: right

### Font Weight
- `font-thin` - font-weight: 100
- `font-normal` - font-weight: 400
- `font-medium` - font-weight: 500
- `font-semibold` - font-weight: 600
- `font-bold` - font-weight: 700

### Font Size
- `text-xs` - 0.75rem
- `text-sm` - 0.875rem
- `text-base` - 1rem
- `text-lg` - 1.125rem
- `text-xl` - 1.25rem
- `text-2xl` - 1.5rem
- `text-3xl` - 1.875rem
- `text-4xl` - 2.25rem

### Text Transform
- `uppercase` - text-transform: uppercase
- `lowercase` - text-transform: lowercase
- `capitalize` - text-transform: capitalize

**Example:**
```html
<h1 class="text-3xl font-bold text-center">Title</h1>
<p class="text-base font-normal text-left">Paragraph</p>
```

## Color Utilities

### Text Colors
- `text-primary` - #667eea
- `text-secondary` - #6c757d
- `text-success` - #28a745
- `text-danger` - #dc3545
- `text-dark` - #333
- `text-white` - #ffffff

### Background Colors
- `bg-primary` - #667eea
- `bg-white` - #ffffff
- `bg-light` - #f8f9fa
- `bg-transparent` - transparent

**Example:**
```html
<div class="bg-white text-dark p-4">White background</div>
<span class="text-primary font-semibold">Primary color text</span>
```

## Border Utilities

### Border Width
- `border` - 1px border
- `border-0` - No border
- `border-2` - 2px border
- `border-4` - 4px border

### Border Radius
- `rounded` - 0.25rem
- `rounded-md` - 0.375rem
- `rounded-lg` - 0.5rem
- `rounded-xl` - 0.75rem
- `rounded-2xl` - 1rem
- `rounded-full` - 9999px

**Example:**
```html
<div class="border rounded-lg p-4">Bordered rounded box</div>
```

## Shadow Utilities

- `shadow-none` - No shadow
- `shadow-sm` - Small shadow
- `shadow` - Default shadow
- `shadow-md` - Medium shadow
- `shadow-lg` - Large shadow
- `shadow-xl` - Extra large shadow

**Example:**
```html
<div class="bg-white rounded-lg shadow-md p-4">Card with shadow</div>
```

## Width & Height Utilities

### Width
- `w-auto` - width: auto
- `w-full` - width: 100%
- `w-1` to `w-24` - Fixed widths

### Height
- `h-auto` - height: auto
- `h-full` - height: 100%
- `h-screen` - height: 100vh
- `min-h-screen` - min-height: 100vh

**Example:**
```html
<div class="w-full h-screen">Full width and height</div>
```

## Position Utilities

- `position-static` - position: static
- `position-relative` - position: relative
- `position-absolute` - position: absolute
- `position-fixed` - position: fixed
- `position-sticky` - position: sticky

### Z-Index
- `z-0` to `z-2000` - Z-index values

**Example:**
```html
<div class="position-sticky top-0 z-100">Sticky header</div>
```

## Common Patterns

### Card Component
Instead of:
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
```

Use:
```html
<div class="bg-white rounded-xl p-8 shadow-lg">
  Card content
</div>
```

### Flex Container
Instead of:
```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
```

Use:
```html
<div class="d-flex justify-between items-center gap-4">
  Content
</div>
```

### Grid Layout
Instead of:
```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

Use:
```html
<div class="d-grid grid-cols-3 grid-gap-6">
  Items
</div>
```

## Migration Strategy

1. **Identify common patterns** - Look for repeated CSS properties
2. **Replace in HTML** - Add utility classes directly to HTML elements
3. **Remove CSS** - Once utilities are in place, remove the component-specific CSS
4. **Keep component classes** - Only for component-specific behaviors (hover states, animations, etc.)

## Notes

- Component-specific styles (hover states, animations, transitions) should remain in CSS
- Utility classes are meant for common layout and styling patterns
- You can combine multiple utility classes on the same element
- Responsive utilities can be added in the future if needed

