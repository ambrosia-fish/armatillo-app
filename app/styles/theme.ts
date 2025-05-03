/**
 * Armatillo Theme System
 * 
 * Centralized design system for consistent styling across the app.
 * All colors, spacing, typography, and component-specific styles should be defined here.
 */
import { FlexAlignType, TextStyle, ViewStyle } from 'react-native';
/**
 * Color palette
 */
export const colors = {
  // Primary brand colors - based on #485283 (deep periwinkle blue)
  primary: {
    main: '#485283',
    light: '#6B74A0',
    dark: '#363D66',
    contrast: '#ffffff',
  },
  
  // Secondary accent colors - complementary color to primary (warm golden)
  secondary: {
    main: '#D0A94B',
    light: '#E9C778',
    dark: '#A78932',
    contrast: '#ffffff',
  },
  
  // Neutral colors for text, backgrounds, etc.
  neutral: {
    white: '#ffffff',
    lightest: '#F8F9FC',
    lighter: '#F0F2F8',
    light: '#E6E9F2',
    medium: '#D8DDEA',
    gray: '#A3ACCB',
    darkGray: '#7D84A1',
    dark: '#4A4E63',
    darker: '#32344A',
    black: '#212230',
  },
  
  // Utility colors
  utility: {
    success: '#6BA877',
    info: '#5F81D0',
    warning: '#E9B668',
    error: '#D66A6A',
    disabled: '#C9CEDA',
  },
  
  // Status colors for BFRB tracking (gradients based on periwinkle/purple)
  status: {
    low: '#A3ACCB',
    medium: '#9484AC',
    high: '#7A63A0',
    critical: '#66467F',
  },
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#F0F2F8',
    card: '#ffffff',
    modal: 'rgba(72, 82, 131, 0.5)',
  },
  
  // Text colors
  text: {
    primary: '#32344A',
    secondary: '#4A4E63',
    tertiary: '#7D84A1',
    disabled: '#C9CEDA',
    inverse: '#ffffff',
    link: '#485283',
  },
  
  // Border colors
  border: {
    light: '#E6E9F2',
    medium: '#D8DDEA',
    dark: '#A3ACCB',
    input: '#D8DDEA',
    focus: '#485283',
  },
  
  // Accent colors (for highlights, callouts, etc.)
  accent: {
    lavender: '#9484AC',
    periwinkle: '#969FCC',
    skyBlue: '#80B0D8',
    sage: '#8AAD9F',
    mauve: '#A07B8D',
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
    } as ViewStyle,
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    } as TextStyle,
    subtitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    } as TextStyle,
    content: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    } as TextStyle,
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
        alignItems: 'center' as FlexAlignType,
        justifyContent: 'center' as 'center',
      } as ViewStyle,
      text: {
        color: colors.primary.contrast,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
      } as TextStyle,
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
        alignItems: 'center' as FlexAlignType,
        justifyContent: 'center' as 'center',
      } as ViewStyle,
      text: {
        color: colors.primary.main,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
      } as TextStyle,
    },
    // Text button
    text: {
      container: {
        backgroundColor: 'transparent',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center' as FlexAlignType,
        justifyContent: 'center' as 'center',
      } as ViewStyle,
      text: {
        color: colors.primary.main,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
      } as TextStyle,
    },
    // Disabled button
    disabled: {
      container: {
        backgroundColor: colors.utility.disabled,
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center' as FlexAlignType,
        justifyContent: 'center' as 'center',
      } as ViewStyle,
      text: {
        color: colors.text.disabled,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
      } as TextStyle,
    },
  },
  
  // Input styles
  input: {
    container: {
      marginBottom: spacing.lg,
    } as ViewStyle,
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    } as TextStyle,
    field: {
      backgroundColor: colors.neutral.lighter,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border.input,
      padding: spacing.lg,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    } as TextStyle,
    errorText: {
      fontSize: typography.fontSize.sm,
      color: colors.utility.error,
      marginTop: spacing.xs,
    } as TextStyle,
  },
  
  // Header styles
  header: {
    container: {
      flexDirection: 'row' as 'row',
      alignItems: 'center' as FlexAlignType,
      justifyContent: 'space-between' as 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.primary,
    } as ViewStyle,
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
    } as TextStyle,
    icon: {
      padding: spacing.sm,
    } as ViewStyle,
  },
  
  // Modal styles
  modal: {
    overlay: {
      flex: 1,
      backgroundColor: colors.background.modal,
      justifyContent: 'center' as 'center',
      alignItems: 'center' as FlexAlignType,
      padding: spacing.lg,
    } as ViewStyle,
    container: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      width: '100%',
      maxWidth: 400,
      ...shadows.lg,
    } as ViewStyle,
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing.md,
      color: colors.primary.main,
    } as TextStyle,
    content: {
      fontSize: typography.fontSize.md,
      marginBottom: spacing.xl,
      lineHeight: typography.lineHeight.normal,
    } as TextStyle,
    buttonContainer: {
      flexDirection: 'row' as 'row',
      justifyContent: 'space-between' as 'space-between',
    } as ViewStyle,
  },
  
  // Form section styles
  formSection: {
    container: {
      marginBottom: spacing.xl,
    } as ViewStyle,
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semiBold,
      marginBottom: spacing.md,
      color: colors.text.primary,
    } as TextStyle,
    description: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      marginBottom: spacing.lg,
      lineHeight: typography.lineHeight.normal,
    } as TextStyle,
  },
  
  // List item styles
  listItem: {
    container: {
      flexDirection: 'row' as 'row',
      alignItems: 'center' as FlexAlignType,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    } as ViewStyle,
    title: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    } as TextStyle,
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    } as TextStyle,
    icon: {
      marginRight: spacing.md,
    } as ViewStyle,
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