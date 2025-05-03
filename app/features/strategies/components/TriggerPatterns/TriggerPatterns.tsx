import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  ViewStyle,
  TextStyle,
  LayoutAnimation,
  Platform,
  ScrollView
} from 'react-native';
import { Text } from '@/app/components';
import { useAuth } from '@/app/store/contexts/AuthContext';
import api from '@/app/services/api/base';
import strategiesApi from '@/app/services/api/strategies';
import theme from '@/app/styles/theme';
import { ensureValidToken } from '@/app/features/auth/utils/tokenRefresher';
import OptionDictionaries, { OptionItem } from '@/app/constants/options';
import TriggerPill from '@/app/components/TriggerPill';
import { router } from 'expo-router';

interface TriggerCount {
  emoji: string;
  label: string;
  count: number;
  id: string;
}

interface TriggerPatternsProps {
  onError?: (error: string) => void;
  minCount?: number; // Minimum count to display an item
}

/**
 * TriggerCloud component that displays emojis in single rows
 * with only significant trigger patterns (count >= minCount)
 */
const TriggerPatterns: React.FC<TriggerPatternsProps> = ({ 
  onError, 
  minCount = 5 // Default to 5+ occurrences
}) => {
  const [triggerCounts, setTriggerCounts] = useState<TriggerCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  
  // Fetch emoji data from the API
  useEffect(() => {
    const fetchTriggerData = async () => {
      if (!isAuthenticated) {
        console.log('TriggerPatterns: Not authenticated, skipping fetch');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Make sure token is valid before making the request
        await ensureValidToken();
        
        // Fetch all instances
        const instances = await api.instances.getInstances();
        
        if (!Array.isArray(instances)) {
          throw new Error('Received invalid response format from server');
        }
        
        // Process instances to count emojis/labels
        const triggerMap = new Map<string, TriggerCount>();
        
        // Process option dictionaries (location, activity, emotions, thoughts, sensations)
        const processCategory = (instanceCategory: string[], optionsList: OptionItem[]) => {
          if (!instanceCategory || !Array.isArray(instanceCategory) || instanceCategory.length === 0) return;
          
          instanceCategory.forEach(itemId => {
            const option = optionsList.find(opt => opt.id === itemId);
            if (option && option.emoji && option.label) {
              addToTriggerMap(triggerMap, option.emoji, option.label, option.id);
            }
          });
        };
        
        // Go through each instance and extract category data
        instances.forEach(instance => {
          // Process environments/locations
          processCategory(
            instance.selectedEnvironments || instance.selectedLocations, 
            OptionDictionaries.locationOptions || OptionDictionaries.environmentOptions
          );
          
          // Process activities
          processCategory(
            instance.selectedActivities,
            OptionDictionaries.activityOptions
          );
          
          // Process emotions
          processCategory(
            instance.selectedEmotions,
            OptionDictionaries.emotionOptions
          );
          
          // Process thoughts
          processCategory(
            instance.selectedThoughts,
            OptionDictionaries.thoughtOptions
          );
          
          // Process sensations
          processCategory(
            instance.selectedSensations,
            OptionDictionaries.sensationOptions
          );
        });
        
        // Convert map to array, filter by minimum count
        let filteredTriggers = Array.from(triggerMap.values())
          .filter(item => item.count >= minCount);
        
        // Fetch all strategies to filter out triggers that already have strategies
        const strategies = await strategiesApi.getStrategies();
        
        // Filter out triggers that already have associated strategies
        filteredTriggers = filteredTriggers.filter(trigger => {
          // Check if any strategy has this trigger
          return !strategies.some(strategy => {
            // Check if strategy.trigger is a string
            if (typeof strategy.trigger === 'string') {
              return strategy.trigger === trigger.id;
            }
            // Check if strategy.trigger is an object with id property
            else if (strategy.trigger && typeof strategy.trigger === 'object') {
              return strategy.trigger.id === trigger.id;
            }
            return false;
          });
        });
        
        // Sort by count (descending)
        filteredTriggers = filteredTriggers.sort((a, b) => b.count - a.count);
        
        // Enable animation for the layout change
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setTriggerCounts(filteredTriggers);
        
      } catch (err) {
        console.error('TriggerPatterns: Error fetching trigger data:', err);
        
        const errorMessage = 'Failed to load trigger data';
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTriggerData();
  }, [isAuthenticated, onError, minCount]);
  
  // Helper function to add or increment emoji counts in the map
  const addToTriggerMap = (
    map: Map<string, TriggerCount>, 
    emoji: string, 
    label: string,
    id: string
  ) => {
    const key = `${emoji}_${label}`;
    
    if (map.has(key)) {
      const current = map.get(key)!;
      map.set(key, {
        ...current,
        count: current.count + 1
      });
    } else {
      map.set(key, {
        emoji,
        label,
        count: 1,
        id
      });
    }
  };
  
  // Handler for pill clicks
  const handlePillToggle = (id: string) => {
    console.log('TriggerCloud: Pill clicked:', id);
    
    // Find the trigger details using the id
    const trigger = triggerCounts.find(item => item.id === id);
    
    if (trigger) {
      // Navigate to new strategy screen with the trigger data in the exact format needed
      router.push({
        pathname: '/screens/tracking/new-strategy-screen',
        params: { 
          trigger: JSON.stringify({
            id: trigger.id,
            label: trigger.label,
            emoji: trigger.emoji
          })
        }
      });
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <View style={styles.containerWrapper}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary.main} />
            <Text style={styles.loadingText}>Loading trigger patterns...</Text>
          </View>
        </View>
      </View>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <View style={styles.containerWrapper}>
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      </View>
    );
  }
  
  // Render empty state
  if (triggerCounts.length === 0) {
    return (
      <View style={styles.containerWrapper}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Trigger Patterns</Text>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No new trigger patterns found. Continue logging your habit to discover new patterns.
            </Text>
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.containerWrapper}>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {triggerCounts.map((item) => (
            <View key={item.id} style={styles.pillRow}>
              <TriggerPill
                id={item.id}
                emoji={item.emoji}
                label={item.label}
                count={item.count}
                onToggle={handlePillToggle}
                selected={false}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    // paddingTop: 16, // Add top padding to prevent badge cutoff
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 0, // Remove horizontal padding to allow pills to extend to edge
  } as ViewStyle,
  
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md, // Less horizontal padding to prevent edge cutoff
    ...theme.shadows.sm,
  } as ViewStyle,
  
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  
  scrollView: {
    maxHeight: 250, // Limit height for scrollability
  } as ViewStyle,
  
  scrollContent: {
    paddingBottom: theme.spacing.sm,
  } as ViewStyle,
  
  pillRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  } as ViewStyle,
  
  // Loading state
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  } as ViewStyle,
  
  loadingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.sm,
  } as TextStyle,
  
  // Error state
  errorContainer: {
    padding: theme.spacing.md,
    backgroundColor: 'rgba(214, 106, 106, 0.08)',
    borderRadius: theme.borderRadius.md,
  } as ViewStyle,
  
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.utility.error,
    textAlign: 'center',
  } as TextStyle,
  
  // Empty state
  emptyContainer: {
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
  } as ViewStyle,
  
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  } as TextStyle,
});

export default TriggerPatterns;