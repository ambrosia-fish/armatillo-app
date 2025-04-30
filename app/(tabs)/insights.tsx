import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  SafeAreaView,
  ScrollView,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/context/AuthContext';
import { TriggerPatterns } from '@/app/components';
import theme from '@/app/constants/theme';
import { View, Text } from '@/app/components';
import HistoryScreen from '@/app/screens/tracking/history-screen';

/**
 * Insights tab showing trigger patterns and navigation to history and progress
 */
export default function Insights() {
  const [error, setError] = useState<string | null>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  
  const { isAuthenticated } = useAuth();

  /**
   * Error state component - modern design
   */
  const ErrorState = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Ionicons name="alert-circle-outline" size={24} color={theme.colors.utility.error} />
      </View>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
        </View>
        
        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Trigger Patterns Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trigger Patterns</Text>
            <TriggerPatterns onError={(errorMsg) => setError(errorMsg)} />
            {error && <ErrorState />}
          </View>
          
          {/* Tools Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tools</Text>
            
            {/* History Button */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setHistoryModalVisible(true)}
              activeOpacity={0.7}
              accessibilityLabel="History"
              accessibilityRole="button"
              accessibilityHint="View your tracked entries"
            >
              <View style={styles.optionIconContainer}>
                <Ionicons 
                  name="time-outline" 
                  size={32} 
                  color={theme.colors.primary.main} 
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>History</Text>
                <Text style={styles.optionDescription}>
                  View all of your tracked instances and export data
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={theme.colors.text.tertiary}
              />
            </TouchableOpacity>
            
            {/* Progress Button (disabled) */}
            <TouchableOpacity
              style={[styles.optionCard, styles.disabledCard]}
              activeOpacity={0.7}
              disabled={true}
              accessibilityLabel="Progress (Coming Soon)"
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              accessibilityHint="Feature coming soon: View your progress and data visualization"
            >
              <View style={[styles.optionIconContainer, styles.disabledIcon]}>
                <Ionicons 
                  name="stats-chart-outline" 
                  size={32} 
                  color={theme.colors.utility.disabled} 
                />
              </View>
              <View style={[styles.optionTextContainer, styles.disabledTextContainer]}>
                <Text style={[styles.optionTitle, styles.disabledText]}>Progress</Text>
                <Text style={[styles.optionDescription, styles.disabledText]}>
                  View your progress and data visualization
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
        </ScrollView>
        
        {/* History Modal */}
        <HistoryScreen 
          visible={historyModalVisible}
          onClose={() => setHistoryModalVisible(false)}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  scrollView: {
    flex: 1,
  } as ViewStyle,
  
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  } as ViewStyle,
  
  // Header Styles
  header: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
  } as TextStyle,
  
  // Section Styling
  section: {
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md, // Increased from sm to md for better spacing
  } as TextStyle,
  
  // Option Cards
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md, // Decreased from lg to md for more consistent spacing
    ...theme.shadows.sm,
  } as ViewStyle,
  
  disabledCard: {
    opacity: 0.8,
    backgroundColor: theme.colors.neutral.lighter,
  } as ViewStyle,
  
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary.light + '20', // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.lg,
  } as ViewStyle,
  
  disabledIcon: {
    backgroundColor: theme.colors.neutral.light,
  } as ViewStyle,
  
  optionTextContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
  } as ViewStyle,
  
  disabledTextContainer: {
    backgroundColor: 'transparent', // Make it inherit parent's background color
  } as ViewStyle,
  
  optionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  
  disabledText: {
    color: theme.colors.text.disabled,
  } as TextStyle,
  
  optionDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  
  comingSoonBadge: {
    backgroundColor: theme.colors.utility.disabled,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  } as ViewStyle,
  
  comingSoonText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  // Error State
  errorContainer: {
    margin: theme.spacing.md, // Changed from lg to md for consistency
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(214, 106, 106, 0.08)',
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  } as ViewStyle,
  
  errorIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(214, 106, 106, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  errorText: {
    textAlign: 'center',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md, // Changed from lg to md
    fontSize: theme.typography.fontSize.md,
  } as TextStyle,
});