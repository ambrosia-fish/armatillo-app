# Armatillo App Navigation Guide

## Navigation Structure

The Armatillo App uses a simplified navigation structure with pure React Native components for consistent UI across all screens.

### Basic Header Implementation

Each screen includes a simple, consistent header with these components:

```tsx
<View style={styles.header}>
  <TouchableOpacity 
    onPress={() => router.back()} 
    style={styles.backButton}
    accessibilityLabel="Go back"
  >
    <Ionicons name="chevron-back" size={24} color={theme.colors.primary.main} />
  </TouchableOpacity>
  
  <RNText style={styles.headerTitle}>Screen Title</RNText>
  
  {/* Empty view for layout balance */}
  <View style={styles.headerRight} />
</View>
```

### Consistent Button Styling

Buttons across the app use simple TouchableOpacity components with consistent styling:

```tsx
<TouchableOpacity
  style={styles.continueButton}
  onPress={handleButtonAction}
  activeOpacity={0.8}
>
  <RNText style={styles.continueButtonText}>Continue</RNText>
</TouchableOpacity>
```

### Standard Styles

These header and button styles are consistently applied across all screens:

```tsx
header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: theme.spacing.lg,
  paddingVertical: theme.spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border.light,
},
headerTitle: {
  fontSize: theme.typography.fontSize.lg,
  fontWeight: 'bold',
  color: theme.colors.text.primary,
  textAlign: 'center',
},
backButton: {
  padding: 8,
},
headerRight: {
  width: 40,
},
```

## Navigation Flow

1. The app uses Expo Router for navigation
2. Navigation between screens is handled with `router.push()` and `router.back()`
3. Screen transitions follow a consistent pattern through the tracking flow

## Adding New Screens

When adding new screens to the app:

1. Follow the established pattern for headers and navigation
2. Use pure React Native components for all UI elements
3. Maintain consistent styling based on the theme
4. Use standard back button handling with `router.back()`

## Accessibility

The navigation components include accessibility labels for better screen reader support:

```tsx
<TouchableOpacity 
  onPress={() => router.back()} 
  style={styles.backButton}
  accessibilityLabel="Go back"
>
  <Ionicons name="chevron-back" size={24} color={theme.colors.primary.main} />
</TouchableOpacity>
```

## Key Benefits

- Simplified UI with fewer custom components
- Consistent navigation across all screens
- Standard React Native patterns for better maintainability
- Improved accessibility
- Reduced bundle size by using native components
