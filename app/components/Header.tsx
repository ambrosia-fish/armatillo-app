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
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';

// Type for Ionicons names
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface HeaderProps {
  title: string;
  leftIcon?: IoniconsName;
  rightIcon?: IoniconsName;
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
 * 
 * @param props - Component properties
 * @returns Rendered header component with configurable buttons and title
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
  
  /**
   * Default back button handler with error handling
   */
  const handleBackPress = () => {
    try {
      router.back();
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'Header', 
          action: 'backNavigation',
          title
        }
      });
    }
  };

  /**
   * Handle left button press with error handling
   */
  const handleLeftPress = () => {
    if (!onLeftPress) return;
    
    try {
      onLeftPress();
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'Header', 
          action: 'leftButtonPress',
          title,
          leftIcon,
          leftText
        }
      });
    }
  };

  /**
   * Handle right button press with error handling
   */
  const handleRightPress = () => {
    if (!onRightPress) return;
    
    try {
      onRightPress();
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'Header', 
          action: 'rightButtonPress',
          title,
          rightIcon,
          rightText
        }
      });
    }
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Left side */}
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity 
            onPress={onLeftPress ? handleLeftPress : handleBackPress}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
        
        {leftIcon && !showBackButton && (
          <TouchableOpacity 
            onPress={handleLeftPress}
            style={styles.iconButton}
            disabled={!onLeftPress}
            accessibilityRole="button"
            accessibilityLabel={leftIcon}
          >
            <Ionicons name={leftIcon} size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
        
        {leftText && (
          <TouchableOpacity 
            onPress={handleLeftPress}
            disabled={!onLeftPress}
            accessibilityRole="button"
            accessibilityLabel={leftText}
          >
            <Text style={styles.actionText}>{leftText}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Title */}
      <Text 
        style={[styles.title, titleStyle]} 
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>
      
      {/* Right side */}
      <View style={styles.rightContainer}>
        {rightText && (
          <TouchableOpacity 
            onPress={handleRightPress}
            disabled={!onRightPress}
            accessibilityRole="button"
            accessibilityLabel={rightText}
          >
            <Text style={styles.actionText}>{rightText}</Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={handleRightPress}
            style={styles.iconButton}
            disabled={!onRightPress}
            accessibilityRole="button"
            accessibilityLabel={rightIcon}
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
  } as ViewStyle,
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  } as ViewStyle,
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  } as ViewStyle,
  title: {
    ...theme.componentStyles.header.title,
    flex: 2,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.bold as '700',
  } as TextStyle,
  iconButton: {
    ...theme.componentStyles.header.icon,
  } as ViewStyle,
  actionText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.primary.main,
  } as TextStyle,
});

export default Header;