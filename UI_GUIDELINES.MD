# Armatillo UI Design Guidelines

This document outlines the UI design principles and guidelines for the Armatillo app to ensure visual consistency and a polished user experience across all screens.

## Core Design Principles

- **Clean & Minimal**: Favor white space and clean layouts over cluttered interfaces
- **Accessible**: Ensure text is readable and interactive elements are easy to tap
- **Consistent**: Maintain visual consistency across all screens
- **Modern**: Use subtle shadows, rounded corners, and visual hierarchy

## Color System

All colors should be sourced from the theme file (`app/constants/theme.ts`) to ensure consistency:

### Primary Colors
- **Primary Main**: `#485283` (Deep periwinkle blue) - Used for primary buttons, active states, and key UI elements
- **Primary Light**: `#6B74A0` - Used for hover states and secondary emphasis
- **Primary Dark**: `#363D66` - Used for pressed states
- **Primary Contrast**: `#ffffff` - Text/icons on primary backgrounds

### Utility Colors
- **Success**: `#6BA877` - Success messages and indicators
- **Info**: `#5F81D0` - Informational messages
- **Warning**: `#E9B668` - Warnings and alerts
- **Error**: `#D66A6A` - Error states and destructive actions

### Background Colors
- **Primary Background**: `#ffffff` - Main background for screens
- **Secondary Background**: `#F0F2F8` - Secondary/alternative background

## Typography

- **Title (Large)**: 24px, Bold - Main screen titles
- **Title (Medium)**: 20px, Bold - Section headers
- **Subtitle**: 18px, SemiBold - Important sub-headings
- **Body**: 16px, Regular - Main content text
- **Caption**: 14px, Regular - Secondary information
- **Small Text**: 12px, Regular - Tertiary information

## Layout & Spacing

- **Container Padding**: 16px (theme.spacing.lg) on all sides
- **Section Spacing**: 20px (theme.spacing.xl) between major sections
- **Item Spacing**: 12px (theme.spacing.md) between related items

## UI Components

### Cards
- White background
- 16px (theme.borderRadius.lg) border radius
- Subtle shadow:
  ```
  shadowColor: theme.colors.neutral.dark,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
  ```
- 16px (theme.spacing.lg) internal padding
- No visible borders between cards

### Buttons
- **Primary Button**:
  - Primary main color background
  - 12px (theme.borderRadius.md) border radius
  - Centered white text
  - 16px horizontal padding, 12px vertical padding
  - activeOpacity: 0.8

- **Secondary Button**:
  - White background
  - Primary color border/text
  - Same dimensions as primary button

- **Text Button**:
  - No background
  - Primary color text
  - No visible borders

### Icon Containers
- Circular shape (1:1 aspect ratio)
- Light background color (typically 0.1 opacity of primary or utility color)
- Centered icon
- Consistent sizes:
  - Large: 40px diameter
  - Medium: 36px diameter
  - Small: 30px diameter

### List Items
- White background
- Subtle separator (0.5px, rgba(0,0,0,0.05))
- Left-aligned content
- Right-aligned actions/controls
- Comfortable touch target (min 44px height)

### Form Controls
- **Text Inputs**:
  - Light background
  - 12px (theme.borderRadius.md) border radius
  - Clear focus state

- **Switches**:
  - Use React Native's standard Switch component
  - Custom trackColor and thumbColor from theme

## States & Feedback

### Loading States
- Use centered ActivityIndicator with descriptive text
- For inline loading, use horizontal layout with smaller indicator

### Empty States
- Large centered icon (preferably in a circular container)
- Clear title explaining the empty state
- Helpful supporting text
- Optional action button

### Error States
- Light error background (rgba(214, 106, 106, 0.08))
- Error icon
- Clear error message
- Retry/action button

## Navigation

- Use bottom tab navigation with icons and labels
- Active tab should use primary color
- Inactive tabs should use tertiary text color

## Modals & Overlays

- White background
- 16px (theme.borderRadius.lg) border radius
- Subtle shadow
- Clear action buttons (primary and cancel)

## Animations & Transitions

- Keep animations subtle and quick (300ms or less)
- Use opacity and transform for transitions
- Avoid jarring or flashy animations

## Accessibility

- Ensure touch targets are at least 44x44 points
- Use sufficient color contrast (4.5:1 minimum)
- Support dynamic text sizes

## Implementation Notes

- Always use theme variables instead of hardcoded values
- Use style composition instead of repetition
- Test UI on multiple device sizes
- Keep styles in a StyleSheet at the end of each component file