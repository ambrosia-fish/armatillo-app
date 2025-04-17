import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ViewStyle, 
  TextStyle, 
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/app/constants/theme';
import { View, Text } from '@/app/components';

/**
 * Strategies Screen Component
 * Displays user's triggers and corresponding strategies
 */
export default function StrategiesScreen() {
  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <SafeAreaView style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          testID="strategies-screen-scroll"
          accessibilityLabel="Strategies screen"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Strategies</Text>
            {/* <TouchableOpacity 
              style={styles.addButton}
              onPress={() => console.log('Add new strategy')}
              accessibilityLabel="Add new strategy"
              accessibilityRole="button"
            >
              <Ionicons name="add" size={24} color={theme.colors.primary.main} />
            </TouchableOpacity> */}
          </View>

          {/* Placeholder Content */}
          <View style={styles.content}>
            <Text style={styles.emptyText}>
              This is where you'll see your triggers and strategies.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxxl,
  } as ViewStyle,
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  } as ViewStyle,
  
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
  } as TextStyle,
  
  addButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.circular,
    backgroundColor: 'rgba(72, 82, 131, 0.1)',
  } as ViewStyle,
  
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  } as TextStyle,
});