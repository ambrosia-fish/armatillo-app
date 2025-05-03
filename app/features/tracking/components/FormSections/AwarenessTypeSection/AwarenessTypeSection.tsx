import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@/app/styles/theme';

interface AwarenessTypeSectionProps {
  awarenessType: 'automatic' | 'intentional';
  toggleAwarenessType: () => void;
}

const AwarenessTypeSection: React.FC<AwarenessTypeSectionProps> = ({ 
  awarenessType, 
  toggleAwarenessType 
}) => {
  // Helper function to set awareness type
  const handleSelectAwarenessType = (type: 'automatic' | 'intentional') => {
    // Only toggle if needed
    if (awarenessType !== type) {
      toggleAwarenessType();
    }
  };

  return (
    <View style={styles.formSection}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Was it automatic or intentional?</Text>
      </View>
      <Text style={styles.subtitle}>
        Did you engage in the behavior automatically (without thinking) or intentionally (with awareness)?
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.awarenessButton,
            awarenessType === 'automatic' && styles.activeButton,
          ]}
          onPress={() => handleSelectAwarenessType('automatic')}
          accessible={true}
          accessibilityLabel="Automatic"
          accessibilityHint="Select if behavior occurred without thinking or awareness"
          accessibilityRole="button"
          accessibilityState={{ selected: awarenessType === 'automatic' }}
        >
          <Text style={[
            styles.buttonTitle,
            awarenessType === 'automatic' && styles.activeButtonText
          ]}>
            Automatic
          </Text>
          <Text style={[
            styles.buttonSubtitle,
            awarenessType === 'automatic' && styles.activeButtonText
          ]}>
            Without thinking or awareness
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.awarenessButton,
            awarenessType === 'intentional' && styles.activeButton,
          ]}
          onPress={() => handleSelectAwarenessType('intentional')}
          accessible={true}
          accessibilityLabel="Intentional"
          accessibilityHint="Select if behavior occurred with awareness or conscious intent"
          accessibilityRole="button"
          accessibilityState={{ selected: awarenessType === 'intentional' }}
        >
          <Text style={[
            styles.buttonTitle,
            awarenessType === 'intentional' && styles.activeButtonText
          ]}>
            Intentional
          </Text>
          <Text style={[
            styles.buttonSubtitle,
            awarenessType === 'intentional' && styles.activeButtonText
          ]}>
            With awareness/conscious intent
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    marginBottom: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    position: 'relative',
    width: '100%',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  awarenessButton: {
    flex: 1,
    backgroundColor: theme.colors.neutral.light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  activeButton: {
    backgroundColor: theme.colors.primary.main,
  },
  buttonTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  buttonSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  activeButtonText: {
    color: theme.colors.neutral.white,
  },
});

export default AwarenessTypeSection;