import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '@/app/styles/theme';
import { errorService } from '@/app/services/error/ErrorService';

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
  simple?: boolean; // Flag to use simplified header style
}

/**
 * Unified header component that can be used across the app
 * Supports both complex and simple styles with consistent API
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
  simple = false,
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

  // For simple header, determine which icon to use for back button based on platform
  const backIconName = Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back';
  
  // Determine which styles to use based on the 'simple' flag
  const containerStyles = [
    styles.container, 
    simple ? styles.simpleContainer : null, 
    containerStyle
  ];
  
  return (
    <View style={containerStyles} accessibilityRole="header">
      {/* Left side */}
      <View style={simple ? styles.simpleLeftContainer : styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity 
            onPress={onLeftPress ? handleLeftPress : handleBackPress}
            style={simple ? styles.simpleIconButton : styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Navigate to previous screen"
          >
            <Ionicons 
              name={simple ? backIconName : "arrow-back"} 
              size={24} 
              color={simple ? theme.colors.primary.main : theme.colors.text.primary} 
            />
          </TouchableOpacity>
        )}
        
        {leftIcon && !showBackButton && (
          <TouchableOpacity 
            onPress={handleLeftPress}
            style={simple ? styles.simpleIconButton : styles.iconButton}
            disabled={!onLeftPress}
            accessibilityRole="button"
            accessibilityLabel={leftIcon.replace(/-/g, ' ')}
            accessibilityHint={onLeftPress ? "Activate left button function" : undefined}
          >
            <Ionicons 
              name={leftIcon} 
              size={24} 
              color={simple ? theme.colors.primary.main : theme.colors.text.primary} 
            />
          </TouchableOpacity>
        )}
        
        {leftText && !simple && (
          <TouchableOpacity 
            onPress={handleLeftPress}
            disabled={!onLeftPress}
            accessibilityRole="button"
            accessibilityLabel={leftText}
            accessibilityHint={onLeftPress ? "Activate left button function" : undefined}
          >
            <Text style={styles.actionText}>{leftText}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Title */}
      <Text 
        style={[
          styles.title, 
          simple ? styles.simpleTitle : null,
          titleStyle
        ]} 
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>
      
      {/* Right side */}
      <View style={simple ? styles.simpleRightContainer : styles.rightContainer}>
        {rightText && !simple && (
          <TouchableOpacity 
            onPress={handleRightPress}
            disabled={!onRightPress}
            accessibilityRole="button"
            accessibilityLabel={rightText}
            accessibilityHint={onRightPress ? "Activate right button function" : undefined}
          >
            <Text style={styles.actionText}>{rightText}</Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={handleRightPress}
            style={simple ? styles.simpleIconButton : styles.iconButton}
            disabled={!onRightPress}
            accessibilityRole="button"
            accessibilityLabel={rightIcon.replace(/-/g, ' ')}
            accessibilityHint={onRightPress ? "Activate right button function" : undefined}
          >
            <Ionicons 
              name={rightIcon} 
              size={24} 
              color={simple ? theme.colors.primary.main : theme.colors.text.primary} 
            />
          </TouchableOpacity>
        )}
        
        {/* Empty spacer for the simple header to maintain balance */}
        {simple && !rightIcon && (
          <View style={styles.placeholderWidth} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  simpleContainer: {
    // Any additional styles specific to simple mode
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  simpleLeftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  simpleRightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    flex: 2,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
  },
  simpleTitle: {
    flex: 1,
  },
  iconButton: {
    padding: 4,
  },
  simpleIconButton: {
    padding: 4,
  },
  actionText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.primary.main,
  },
  placeholderWidth: {
    width: 24,
  },
});

export default Header;