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
import theme from '../constants/theme';

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
 * Themed Card component
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
  const CardContainer = onPress ? TouchableOpacity : View;
  
  return (
    <CardContainer
      style={[styles.container, containerStyle]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : undefined}
      {...rest}
    >
      {title && (
        <Text style={[styles.title, titleStyle]}>
          {title}
        </Text>
      )}
      
      {subtitle && (
        <Text style={[styles.subtitle, subtitleStyle]}>
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
  },
  title: {
    ...theme.componentStyles.card.title,
  },
  subtitle: {
    ...theme.componentStyles.card.subtitle,
  },
  content: {
    marginTop: theme.spacing.sm,
  },
});

export default Card;
