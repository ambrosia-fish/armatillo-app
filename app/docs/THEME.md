# Armatillo Theme System

This document describes the theming system for the Armatillo app, providing guidelines for consistent styling across the application.

## Theme Structure

The theme system is organized into several key sections:

- **Colors**: Brand colors, neutrals, and utility colors
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Standard spacing values for margins, padding, etc.
- **Border radius**: Standard border radius values
- **Shadows**: Standardized shadow styles
- **Component Styles**: Pre-defined styles for common components

## Using the Theme

Import the theme in your component:

```typescript
import theme from '../constants/theme';
```

### Colors

Use theme colors instead of hardcoded values:

```typescript
// WRONG ❌
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a9d8f',
  },
});

// RIGHT ✅
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary.main,
  },
});
```

### Spacing

Use theme spacing for consistency:

```typescript
// WRONG ❌
const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 24,
  },
});

// RIGHT ✅
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});
```

### Typography

Apply consistent typography:

```typescript
// WRONG ❌
const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

// RIGHT ✅
const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
```

### Component Styles

Use predefined component styles:

```typescript
// WRONG ❌
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

// RIGHT ✅
const styles = StyleSheet.create({
  card: {
    ...theme.componentStyles.card.container,
  },
});
```

## Themed Components

Use the pre-built themed components located in the `app/components` directory:

- **Button**: Customizable button with variants (primary, secondary, text)
- **Input**: Text input with built-in label and error handling
- **Card**: Container for content with consistent styling
- **Header**: Screen header with customizable actions

Example usage:

```jsx
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

// In your component:
return (
  <Card title="Your Information">
    <Input
      label="Email"
      placeholder="Enter your email"
      value={email}
      onChangeText={setEmail}
      error={errors.email}
    />
    
    <Button
      title="Save"
      onPress={handleSave}
      variant="primary"
      size="large"
    />
  </Card>
);
```

## Extending the Theme

To add new theme values:

1. Add the new values to the appropriate section in `app/constants/theme.ts`
2. Use TypeScript interfaces to ensure type safety

## Future Improvements

Planned theme enhancements:

- Support for dark mode
- Accessibility improvements (dynamic font sizes)
- Theme extension API for plugins
