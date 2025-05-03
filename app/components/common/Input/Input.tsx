import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import theme from '@/app/styles/theme';
import { errorService } from '@/app/services/error/ErrorService';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

/**
 * Themed input component with label and error handling
 * 
 * @param props - Component properties including standard TextInput props
 * @param ref - Forwarded ref for TextInput
 * @returns Rendered input component with optional label and error message
 */
const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  onChangeText,
  onFocus,
  onBlur,
  ...rest
}, ref) => {
  /**
   * Handle text changes with error handling
   */
  const handleTextChange = (text: string) => {
    try {
      onChangeText?.(text);
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'Input', 
          label,
          action: 'textChange'
        }
      });
    }
  };

  /**
   * Handle input focus with error handling
   */
  const handleFocus = (event: any) => {
    try {
      onFocus?.(event);
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'Input', 
          label,
          action: 'focus'
        }
      });
    }
  };

  /**
   * Handle input blur with error handling
   */
  const handleBlur = (event: any) => {
    try {
      onBlur?.(event);
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'Input', 
          label,
          action: 'blur'
        }
      });
    }
  };

  return (
    <View 
      style={[styles.container, containerStyle]}
      accessibilityLabel={label ? `${label} input field` : 'Input field'}
    >
      {label && (
        <Text 
          style={[styles.label, labelStyle]}
          accessibilityRole="text"
        >
          {label}
        </Text>
      )}
      
      <TextInput
        ref={ref}
        style={[
          styles.input,
          error ? styles.inputError : null,
          inputStyle
        ]}
        placeholderTextColor={theme.colors.text.tertiary}
        onChangeText={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        accessibilityLabel={label || 'Input field'}
        accessibilityHint={error || undefined}
        {...rest}
      />
      
      {error && (
        <Text 
          style={[styles.errorText, errorStyle]}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
    </View>
  );
});

// Add display name for debugging purposes
Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    ...theme.componentStyles.input.container,
  } as ViewStyle,
  label: {
    ...theme.componentStyles.input.label,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,
  input: {
    ...theme.componentStyles.input.field,
  } as TextStyle,
  inputError: {
    borderColor: theme.colors.utility.error,
  } as TextStyle,
  errorText: {
    ...theme.componentStyles.input.errorText,
  } as TextStyle,
});

export default Input;