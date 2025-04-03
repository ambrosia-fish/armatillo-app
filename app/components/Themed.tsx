/**
 * Themed components using our centralized theme system
 * Provides consistent theming for Text and View components
 */

import React from 'react';
import { Text as DefaultText, View as DefaultView, TextStyle, ViewStyle } from 'react-native';
import theme from '@/app/constants/theme';
import { useColorScheme } from '@/app/hooks/useColorScheme';
import { errorService } from '@/app/services/ErrorService';

// Types for themed components
type ThemeProps = {
  themeColor?: keyof typeof theme.colors.text | keyof typeof theme.colors.background;
  style?: TextStyle | ViewStyle;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

/**
 * Text component with themed styling
 * 
 * @param {TextProps} props - Component properties
 * @returns {React.ReactElement} - The themed text element
 */
export function Text(props: TextProps) {
  const { style, themeColor = 'primary', ...otherProps } = props;
  
  try {
    // Default to text.primary color from theme
    const color = theme.colors.text[themeColor as keyof typeof theme.colors.text] || theme.colors.text.primary;
    return <DefaultText style={[{ color }, style]} {...otherProps} />;
  } catch (err) {
    // Log error but still render with fallback
    errorService.handleError(err instanceof Error ? err : String(err), {
      level: 'error',
      source: 'ui',
      displayToUser: false,
      context: { 
        component: 'ThemedText', 
        themeColor,
        props: JSON.stringify(otherProps)
      }
    });
    // Fallback to default styling
    return <DefaultText style={style} {...otherProps} />;
  }
}

/**
 * View component with themed styling
 * 
 * @param {ViewProps} props - Component properties
 * @returns {React.ReactElement} - The themed view element
 */
export function View(props: ViewProps) {
  const { style, themeColor = 'primary', ...otherProps } = props;
  
  try {
    // Default to background.primary color from theme
    const backgroundColor = theme.colors.background[themeColor as keyof typeof theme.colors.background] || theme.colors.background.primary;
    return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
  } catch (err) {
    // Log error but still render with fallback
    errorService.handleError(err instanceof Error ? err : String(err), {
      level: 'warning',
      source: 'ui',
      displayToUser: false,
      context: { 
        component: 'ThemedView', 
        themeColor,
        props: JSON.stringify(otherProps)
      }
    });
    // Fallback to default styling
    return <DefaultView style={style} {...otherProps} />;
  }
}

// Export both components
export default {
  Text,
  View
};