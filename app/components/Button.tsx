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
}

/**
 * Button component with various styles based on theme
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
  ...rest
}) => {
  // Determine container style based on variant, size, and disabled state
  const getContainerStyle = () => {
    // Get base style from theme
    let baseStyle;
    
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
    
    return [baseStyle, sizeStyle, style];
  };
  
  // Determine text style based on variant and disabled state
  const getTextStyle = () => {
    // Get base style from theme
    let baseStyle;
    
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
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
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
  },
  smallText: {
    fontSize: theme.typography.fontSize.sm,
  },
  mediumContainer: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  mediumText: {
    fontSize: theme.typography.fontSize.md,
  },
  largeContainer: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  largeText: {
    fontSize: theme.typography.fontSize.lg,
  },
});

export default Button;
