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
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';

// Type for Ionicons names
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SimpleHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: IoniconsName;
  onRightPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * A simplified header component that provides consistent navigation UI across screens
 * 
 * @param {SimpleHeaderProps} props - Component properties
 * @returns {React.ReactElement} - The rendered header
 */
const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightIcon,
  onRightPress,
  containerStyle,
}) => {
  const router = useRouter();
  
  /**
   * Handles back button press with error handling
   */
  const handleBackPress = () => {
    try {
      if (onBackPress) {
        onBackPress();
      } else {
        router.back();
      }
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'SimpleHeader', 
          action: 'backNavigation',
          title
        }
      });
    }
  };
  
  /**
   * Handles right icon button press with error handling
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
          component: 'SimpleHeader', 
          action: 'rightIconPress',
          title,
          rightIcon
        }
      });
    }
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            accessibilityLabel="Back"
            accessibilityRole="button"
            accessibilityHint="Navigate to previous screen"
          >
            <Ionicons 
              name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} 
              size={24} 
              color={theme.colors.primary.main} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <Text 
        style={styles.title} 
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>
      
      <View style={styles.rightContainer}>
        {rightIcon ? (
          <TouchableOpacity
            onPress={handleRightPress}
            disabled={!onRightPress}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={rightIcon.replace(/-/g, ' ')}
          >
            <Ionicons name={rightIcon} size={24} color={theme.colors.primary.main} />
          </TouchableOpacity>
        ) : (
          // Empty view to maintain layout balance
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
  } as ViewStyle,
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  } as ViewStyle,
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  } as ViewStyle,
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
  } as TextStyle,
  backButton: {
    padding: 4,
  } as ViewStyle,
  iconButton: {
    padding: 4,
  } as ViewStyle,
  placeholderWidth: {
    width: 24,
  } as ViewStyle,
});

export default SimpleHeader;