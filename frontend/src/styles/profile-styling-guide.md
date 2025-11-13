# Profile Privacy Styling Guide

## Overview
This document describes the styling enhancements implemented for the profile privacy feature.

## Key Features

### 1. Visual Distinction for Privacy States
- **Public Fields**: Green-tinted borders and backgrounds with unlock icons
- **Private Fields**: Orange-tinted borders and backgrounds with lock icons
- Subtle gradient overlays on hover for better visual feedback

### 2. Consistent Privacy Toggle Styling
- Responsive button design that works on mobile and desktop
- Color-coded: Green for public, Orange for private
- Smooth transitions between states (300ms)
- Icon animations on toggle
- Tooltips for additional context (hidden on mobile)

### 3. Mobile Responsiveness
- Touch-friendly button sizes (minimum 44px height)
- Responsive text that hides on small screens where appropriate
- Optimized spacing for mobile devices
- Stack layout adjustments for narrow viewports

### 4. Smooth Transitions
- All color changes use 300ms cubic-bezier transitions
- Hover effects with scale transforms
- Focus states with outline for accessibility
- Shimmer animation on privacy changes
- Reduced motion support for accessibility

## CSS Classes

### Privacy Field Wrapper
- `.privacy-field-wrapper` - Base wrapper for form fields
- `.privacy-field-public` - Applied to public fields
- `.privacy-field-private` - Applied to private fields

### Input Transitions
- `.privacy-input-transition` - Base transition class for inputs
- `.privacy-input-public` - Public field input styling
- `.privacy-input-private` - Private field input styling

### Privacy Indicators
- `.privacy-indicator` - Badge showing privacy status
- `.privacy-indicator-public` - Public status badge
- `.privacy-indicator-private` - Private status badge

## Accessibility Features

1. **High Contrast Mode**: Increased border widths for better visibility
2. **Reduced Motion**: Disables animations for users who prefer reduced motion
3. **Focus Visible**: Clear focus indicators for keyboard navigation
4. **ARIA Labels**: Proper labeling for screen readers
5. **Touch Targets**: Minimum 44px for mobile accessibility

## Color Scheme

### Light Mode
- Public: Green (#22c55e) with light backgrounds
- Private: Orange (#f97316) with light backgrounds

### Dark Mode
- Public: Light green (#4ade80) with dark backgrounds
- Private: Light orange (#fb923c) with dark backgrounds

## Responsive Breakpoints

- **Mobile**: < 640px
  - Simplified layouts
  - Hidden non-essential text
  - Larger touch targets
  
- **Tablet**: 641px - 1024px
  - Balanced spacing
  - Full feature set
  
- **Desktop**: > 1024px
  - Full feature set
  - Hover effects enabled
  - Tooltips visible

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- CSS custom properties (CSS variables)
- CSS animations and transitions
- Supports prefers-reduced-motion media query
- Supports prefers-contrast media query

## Performance Considerations

- CSS transitions are GPU-accelerated (transform, opacity)
- Minimal repaints with transform-based animations
- Scoped transitions to avoid global performance impact
- Efficient selectors for fast rendering
