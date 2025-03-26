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
import theme from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

/**
 * Themed input component with label and error handling
 */
const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  ...rest
}, ref) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
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
        {...rest}
      />
      
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
});

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
  } as ViewStyle,
  inputError: {
    borderColor: theme.colors.utility.error,
  } as ViewStyle,
  errorText: {
    ...theme.componentStyles.input.errorText,
  } as TextStyle,
});

export default Input;
