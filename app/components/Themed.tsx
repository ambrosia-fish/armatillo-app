/**
 * Themed components using our centralized theme system
 */

import { Text as DefaultText, View as DefaultView, TextStyle, ViewStyle } from 'react-native';
import theme from '../constants/theme';
import { useColorScheme } from '../hooks/useColorScheme';

// Types for themed components
type ThemeProps = {
  themeColor?: keyof typeof theme.colors.text | keyof typeof theme.colors.background;
  style?: TextStyle | ViewStyle;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

/**
 * Text component with themed styling
 */
export function Text(props: TextProps) {
  const { style, themeColor = 'primary', ...otherProps } = props;
  const colorScheme = useColorScheme();
  
  // Default to text.primary color from theme
  const color = theme.colors.text[themeColor as keyof typeof theme.colors.text] || theme.colors.text.primary;

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

/**
 * View component with themed styling
 */
export function View(props: ViewProps) {
  const { style, themeColor = 'primary', ...otherProps } = props;
  const colorScheme = useColorScheme();
  
  // Default to background.primary color from theme
  const backgroundColor = theme.colors.background[themeColor as keyof typeof theme.colors.background] || theme.colors.background.primary;

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

// Export both components
export default {
  Text,
  View
};
