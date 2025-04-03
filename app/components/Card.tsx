import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity
} from 'react-native';
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Themed Card component with optional title, subtitle and touch functionality
 * 
 * @param props - Component properties
 * @returns Rendered card component
 */
const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  onPress,
  containerStyle,
  titleStyle,
  subtitleStyle,
  contentStyle,
  children,
  ...rest
}) => {
  /**
   * Handle card press with error handling
   */
  const handlePress = () => {
    if (!onPress) return;
    
    try {
      onPress();
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'Card', 
          title 
        }
      });
    }
  };
  
  const CardContainer = onPress ? TouchableOpacity : View;
  
  return (
    <CardContainer
      style={[styles.container, containerStyle]}
      onPress={onPress ? handlePress : undefined}
      activeOpacity={onPress ? 0.8 : undefined}
      accessibilityRole={onPress ? "button" : "none"}
      accessibilityLabel={title ? title : "Card"}
      accessibilityHint={onPress ? "Tap to interact" : undefined}
      {...rest}
    >
      {title && (
        <Text 
          style={[styles.title, titleStyle]}
          accessibilityRole="header"
        >
          {title}
        </Text>
      )}
      
      {subtitle && (
        <Text 
          style={[styles.subtitle, subtitleStyle]}
          accessibilityRole="text"
        >
          {subtitle}
        </Text>
      )}
      
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.componentStyles.card.container,
  } as ViewStyle,
  title: {
    ...theme.componentStyles.card.title,
    fontWeight: theme.typography.fontWeight.bold as '700',
  } as TextStyle,
  subtitle: {
    ...theme.componentStyles.card.subtitle,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,
  content: {
    marginTop: theme.spacing.sm,
  } as ViewStyle,
});

export default Card;