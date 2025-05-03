import React from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import theme from '@/app/styles/theme';
import { Header } from '@/app/components';
import { errorService } from '@/app/services/error/ErrorService';

/**
 * Screen that presents options for creating a new BFRB tracking instance
 */
export default function NewOptionsScreen() {
  const router = useRouter();
  
  /**
   * Navigate to the appropriate screen based on the selected option
   */
  const handleOptionSelect = (option: 'fresh' | 'template' | 'tweak' | 'strategy') => {
    try {
      switch (option) {
        case 'fresh':
          // Navigate to the new entry screen (starting fresh)
          router.push('/screens/tracking/new-entry-screen');
          break;
        case 'strategy':
          // Navigate to the strategy selection screen
          router.push('/screens/tracking/use-strategy-screen');
          break;
        case 'template':
          // Template feature not yet implemented
          errorService.handleError('Template feature not implemented', {
            source: 'ui',
            level: 'info',
            context: { action: 'select_template_option' }
          });
          break;
        case 'tweak':
          // Tweaking templates not yet implemented
          errorService.handleError('Template tweaking feature not implemented', {
            source: 'ui',
            level: 'info',
            context: { action: 'select_tweak_template_option' }
          });
          break;
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'navigate_from_new_options', option }
      });
    }
  };

  /**
   * Return to previous screen
   */
  const handleBack = () => {
    try {
      router.back();
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'navigate_back_from_new_options' }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Header 
        title="New Instance" 
        showBackButton 
        onLeftPress={handleBack}
      />
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Select how you want to create this BFRB tracking instance
        </Text>
        
        {/* Start Fresh Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleOptionSelect('fresh')}
          activeOpacity={0.7}
          accessibilityLabel="Start Fresh"
          accessibilityRole="button"
          accessibilityHint="Create a new tracking instance from scratch"
        >
          <View style={styles.optionIconContainer}>
            <Ionicons 
              name="add-circle" 
              size={32} 
              color={theme.colors.primary.main} 
            />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Start Fresh</Text>
            <Text style={styles.optionDescription}>
              Create a new tracking instance from scratch with no pre-filled information
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={theme.colors.text.tertiary}
          />
        </TouchableOpacity>

        {/* Use Strategy Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleOptionSelect('strategy')}
          activeOpacity={0.7}
          accessibilityLabel="Use Strategy"
          accessibilityRole="button"
          accessibilityHint="Create a tracking instance using existing strategies"
        >
          <View style={styles.optionIconContainer}>
            <Ionicons 
              name="bookmarks" 
              size={32} 
              color={theme.colors.primary.main} 
            />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Use Strategy</Text>
            <Text style={styles.optionDescription}>
              Create a tracking instance based on your existing strategies
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={theme.colors.text.tertiary}
          />
        </TouchableOpacity>
        
        {/* Use Template Option (disabled) */}
        <TouchableOpacity
          style={[styles.optionCard, styles.disabledCard]}
          activeOpacity={0.7}
          disabled={true}
          accessibilityLabel="Use Template (Coming Soon)"
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          accessibilityHint="Feature coming soon: Use a saved template"
        >
          <View style={[styles.optionIconContainer, styles.disabledIcon]}>
            <Ionicons 
              name="copy" 
              size={32} 
              color={theme.colors.utility.disabled} 
            />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, styles.disabledText]}>Use Template</Text>
            <Text style={[styles.optionDescription, styles.disabledText]}>
              Use a previously saved template to speed up tracking
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={theme.colors.utility.disabled}
          />
        </TouchableOpacity>
        
        {/* Tweak Templates Option (disabled) */}
        <TouchableOpacity
          style={[styles.optionCard, styles.disabledCard]}
          activeOpacity={0.7}
          disabled={true}
          accessibilityLabel="Tweak Templates (Coming Soon)"
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          accessibilityHint="Feature coming soon: Customize your templates"
        >
          <View style={[styles.optionIconContainer, styles.disabledIcon]}>
            <Ionicons 
              name="settings" 
              size={32} 
              color={theme.colors.utility.disabled} 
            />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, styles.disabledText]}>Tweak Templates</Text>
            <Text style={[styles.optionDescription, styles.disabledText]}>
              Manage and customize your saved templates
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={theme.colors.utility.disabled}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  disabledCard: {
    opacity: 0.8,
    backgroundColor: theme.colors.neutral.lighter,
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary.light + '20', // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.lg,
  },
  disabledIcon: {
    backgroundColor: theme.colors.neutral.light,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  disabledText: {
    color: theme.colors.text.disabled,
  },
  optionDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.utility.disabled,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  comingSoonText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
    color: theme.colors.text.inverse,
  },
});