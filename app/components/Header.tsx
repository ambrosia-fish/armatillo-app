import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../constants/theme';

interface HeaderProps {
  title: string;
  leftIcon?: string;
  rightIcon?: string;
  leftText?: string;
  rightText?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showBackButton?: boolean;
}

/**
 * Reusable themed header component used across screens
 */
const Header: React.FC<HeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  leftText,
  rightText,
  onLeftPress,
  onRightPress,
  containerStyle,
  titleStyle,
  showBackButton = false,
}) => {
  const router = useRouter();
  
  // Default back button handler
  const handleBackPress = () => {
    router.back();
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Left side */}
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity 
            onPress={onLeftPress || handleBackPress}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
        
        {leftIcon && !showBackButton && (
          <TouchableOpacity 
            onPress={onLeftPress}
            style={styles.iconButton}
            disabled={!onLeftPress}
          >
            <Ionicons name={leftIcon} size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
        
        {leftText && (
          <TouchableOpacity 
            onPress={onLeftPress}
            disabled={!onLeftPress}
          >
            <Text style={styles.actionText}>{leftText}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Title */}
      <Text style={[styles.title, titleStyle]} numberOfLines={1}>{title}</Text>
      
      {/* Right side */}
      <View style={styles.rightContainer}>
        {rightText && (
          <TouchableOpacity 
            onPress={onRightPress}
            disabled={!onRightPress}
          >
            <Text style={styles.actionText}>{rightText}</Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightPress}
            style={styles.iconButton}
            disabled={!onRightPress}
          >
            <Ionicons name={rightIcon} size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.componentStyles.header.container,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    ...theme.componentStyles.header.title,
    flex: 2,
    textAlign: 'center',
  },
  iconButton: {
    ...theme.componentStyles.header.icon,
  },
  actionText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary.main,
  },
});

export default Header;
