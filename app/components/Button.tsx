import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  StyleProp, 
  ViewStyle, 
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';

export type ButtonVariant = 'primary' | 'secondary' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress: () => void;
  className?: string;
  fixed?: boolean; // For fixed position buttons at the bottom of the screen
}

/**
 * Button component with various styles based on theme
 * 
 * @param {ButtonProps} props - Component properties
 * @returns {React.ReactElement} - The rendered button
 */
const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'medium',
  title,
  loading = false,
  disabled = false,
  style,
  textStyle,
  onPress,
  className,
  fixed = false,
  ...rest
}) => {
  /**
   * Handle button press with error handling
   */
  const handlePress = () => {
    try {
      onPress();
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'Button', 
          variant, 
          title 
        }
      });
    }
  };

  /**
   * Determine container style based on variant, size, and disabled state
   */
  const getContainerStyle = (): StyleProp<ViewStyle> => {
    // Get base style from theme
    let baseStyle: StyleProp<ViewStyle>;
    
    if (disabled) {
      baseStyle = theme.componentStyles.button.disabled.container;
    } else {
      switch (variant) {
        case 'secondary':
          baseStyle = theme.componentStyles.button.secondary.container;
          break;
        case 'text':
          baseStyle = theme.componentStyles.button.text.container;
          break;
        case 'primary':
        default:
          baseStyle = theme.componentStyles.button.primary.container;
          break;
      }
    }
    
    // Apply size styles
    const sizeStyle = buttonStyles[`${size}Container`];
    
    // Fixed position styles (no PWA-specific adjustments)
    const fixedStyle = fixed ? { marginBottom: 0 } : undefined;
    
    return [baseStyle, sizeStyle, fixedStyle, style];
  };
  
  /**
   * Determine text style based on variant and disabled state
   */
  const getTextStyle = (): StyleProp<TextStyle> => {
    // Get base style from theme
    let baseStyle: StyleProp<TextStyle>;
    
    if (disabled) {
      baseStyle = theme.componentStyles.button.disabled.text;
    } else {
      switch (variant) {
        case 'secondary':
          baseStyle = theme.componentStyles.button.secondary.text;
          break;
        case 'text':
          baseStyle = theme.componentStyles.button.text.text;
          break;
        case 'primary':
        default:
          baseStyle = theme.componentStyles.button.primary.text;
          break;
      }
    }
    
    // Apply size styles
    const sizeStyle = buttonStyles[`${size}Text`];
    
    return [baseStyle, sizeStyle, textStyle];
  };
  
  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={className}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? theme.colors.primary.contrast : theme.colors.primary.main} 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// Additional styles for sizes
const buttonStyles = StyleSheet.create({
  smallContainer: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 44, // Ensure touchable area meets iOS guidelines
  },
  smallText: {
    fontSize: theme.typography.fontSize.sm,
  },
  mediumContainer: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 44, // Ensure touchable area meets iOS guidelines
  },
  mediumText: {
    fontSize: theme.typography.fontSize.md,
  },
  largeContainer: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 48, // Larger minimum height for large buttons
  },
  largeText: {
    fontSize: theme.typography.fontSize.lg,
  },
});

export default Button;