/**
 * Armatillo Theme System
 * 
 * Centralized design system for consistent styling across the app.
 * All colors, spacing, typography, and component-specific styles should be defined here.
 */

/**
 * Color palette
 */
export const colors = {
  // Primary brand colors
  primary: {
    main: '#2a9d8f',
    light: '#52c7ba',
    dark: '#1e7268',
    contrast: '#ffffff',
  },
  
  // Secondary accent colors
  secondary: {
    main: '#e76f51',
    light: '#ff9b7b',
    dark: '#b54e37',
    contrast: '#ffffff',
  },
  
  // Neutral colors for text, backgrounds, etc.
  neutral: {
    white: '#ffffff',
    lightest: '#f8f8f8',
    lighter: '#f5f5f5',
    light: '#eeeeee',
    medium: '#dddddd',
    gray: '#999999',
    darkGray: '#666666',
    dark: '#333333',
    darker: '#222222',
    black: '#000000',
  },
  
  // Utility colors
  utility: {
    success: '#4caf50',
    info: '#2196f3',
    warning: '#ff9800',
    error: '#f44336',
    disabled: '#cccccc',
  },
  
  // Status colors for BFRB tracking
  status: {
    low: '#8bd3c7',
    medium: '#2a9d8f',
    high: '#e76f51',
    critical: '#e63946',
  },
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    card: '#ffffff',
    modal: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999',
    disabled: '#cccccc',
    inverse: '#ffffff',
    link: '#2a9d8f',
  },
  
  // Border colors
  border: {
    light: '#eeeeee',
    medium: '#dddddd',
    dark: '#bbbbbb',
    input: '#e0e0e0',
    focus: '#2a9d8f',
  },
};

/**
 * Typography
 */
export const typography = {
  fontFamily: {
    base: undefined, // Default system font
    mono: 'SpaceMono',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

/**
 * Spacing values (in pixels)
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

/**
 * Border radiuses
 */
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  circle: 9999,
};

/**
 * Shadows
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  xl: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

/**
 * Common component styles
 */
export const componentStyles = {
  // Card styles
  card: {
    container: {
      backgroundColor: colors.background.card,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      ...shadows.sm,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },
    content: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
  },
  
  // Button styles
  button: {
    // Primary button
    primary: {
      container: {
        backgroundColor: colors.primary.main,
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
      },
      text: {
        color: colors.primary.contrast,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
      },
    },
    // Secondary button
    secondary: {
      container: {
        backgroundColor: 'transparent',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.primary.main,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
      },
      text: {
        color: colors.primary.main,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
      },
    },
    // Text button
    text: {
      container: {
        backgroundColor: 'transparent',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
      },
      text: {
        color: colors.primary.main,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
      },
    },
    // Disabled button
    disabled: {
      container: {
        backgroundColor: colors.utility.disabled,
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
      },
      text: {
        color: colors.text.disabled,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
      },
    },
  },
  
  // Input styles
  input: {
    container: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    field: {
      backgroundColor: colors.neutral.lighter,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border.input,
      padding: spacing.lg,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    errorText: {
      fontSize: typography.fontSize.sm,
      color: colors.utility.error,
      marginTop: spacing.xs,
    },
  },
  
  // Header styles
  header: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.primary,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
    },
    icon: {
      padding: spacing.sm,
    },
  },
  
  // Modal styles
  modal: {
    overlay: {
      flex: 1,
      backgroundColor: colors.background.modal,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    container: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      width: '100%',
      maxWidth: 400,
      ...shadows.lg,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing.md,
      color: colors.primary.main,
    },
    content: {
      fontSize: typography.fontSize.md,
      marginBottom: spacing.xl,
      lineHeight: typography.lineHeight.normal,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  },
  
  // Form section styles
  formSection: {
    container: {
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semiBold,
      marginBottom: spacing.md,
      color: colors.text.primary,
    },
    description: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      marginBottom: spacing.lg,
      lineHeight: typography.lineHeight.normal,
    },
  },
  
  // List item styles
  listItem: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    title: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    },
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    icon: {
      marginRight: spacing.md,
    },
  },
};

/**
 * Theme object combining all style elements
 */
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  componentStyles,
};

export default theme;
