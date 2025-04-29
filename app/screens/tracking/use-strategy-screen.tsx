import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ViewStyle, 
  TextStyle, 
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  View as RNView,
  Text as RNText
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import theme from '@/app/constants/theme';
import { View, Text, Card, Header } from '@/app/components';
import { Strategy } from '@/app/components/StrategyCard';
import { strategiesApi } from '@/app/services/strategies-api';
import { errorService } from '@/app/services/ErrorService';
import OptionDictionaries, { OptionItem } from '@/app/constants/optionDictionaries';

// Default trigger to use when none is found
const DEFAULT_TRIGGER: OptionItem = {
  id: 'unknown',
  label: 'Unknown',
  emoji: '❓'
};

/**
 * Use Strategy Screen Component
 * Displays user's strategies to select for creating a tracking instance
 */
export default function UseStrategyScreen() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Fetch strategies on component mount
  useEffect(() => {
    fetchStrategies();
  }, []);

  // Helper function to map trigger strings to OptionItems
  const mapTriggerStringToOptionItem = (triggerString: string): OptionItem => {
    // Handle null or undefined case
    if (!triggerString) {
      console.warn('Received empty trigger string');
      return DEFAULT_TRIGGER;
    }
    
    // Try to find a matching option in our option dictionaries
    const allOptions = [
      ...OptionDictionaries.emotionOptions,
      ...OptionDictionaries.locationOptions,
      ...OptionDictionaries.activityOptions,
      ...OptionDictionaries.thoughtOptions,
      ...OptionDictionaries.sensationOptions
    ];
    
    // Look for a match by ID or label
    const match = allOptions.find(option => 
      option.id.toLowerCase() === triggerString.toLowerCase() || 
      option.label.toLowerCase() === triggerString.toLowerCase()
    );
    
    if (match) {
      return match;
    }
    
    // If not found, create a default option with the string as both id and label
    return {
      id: triggerString,
      label: triggerString,
      emoji: '🔄'
    };
  };

  // Fetch strategies from API
  const fetchStrategies = async () => {
    try {
      setLoading(true);
      // Fetch data from API
      const data = await strategiesApi.getStrategies();
      
      // Transform data to use OptionItem for trigger if needed
      const transformedData = data.map(strategy => {
        // Deep copy to avoid modifying the original
        const strategyObj = { ...strategy };
        
        // Initialize arrays if missing to prevent crashes
        if (!strategyObj.competingResponses) strategyObj.competingResponses = [];
        if (!strategyObj.stimulusControls) strategyObj.stimulusControls = [];
        if (!strategyObj.communitySupports) strategyObj.communitySupports = [];
        if (!strategyObj.notifications) strategyObj.notifications = [];
        
        // Handle missing trigger completely
        if (!strategyObj.trigger) {
          console.warn(`Strategy ${strategyObj._id || 'unknown'} has no trigger`);
          strategyObj.trigger = DEFAULT_TRIGGER;
          return strategyObj;
        }
        
        // If trigger is a string, convert it to an OptionItem
        if (typeof strategyObj.trigger === 'string') {
          strategyObj.trigger = mapTriggerStringToOptionItem(strategyObj.trigger);
        } else if (typeof strategyObj.trigger === 'object' && !strategyObj.trigger.id) {
          // If trigger is an object but missing required properties
          console.warn(`Strategy ${strategyObj._id || 'unknown'} has invalid trigger object`);
          strategyObj.trigger = DEFAULT_TRIGGER;
        }
        
        return strategyObj;
      });
      
      setStrategies(transformedData);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        level: 'error',
        source: 'api',
        context: { 
          component: 'UseStrategyScreen', 
          method: 'fetchStrategies' 
        }
      });
      
      // If API fails, set empty array
      setStrategies([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchStrategies();
  };

  // Handle strategy selection
  const handleSelectStrategy = (strategy: Strategy) => {
    try {
      console.log('Strategy selected:', strategy.name);
      // Log the strategy that was selected
      errorService.handleError('Strategy selection feature in development', {
        source: 'ui',
        level: 'info',
        context: { 
          component: 'UseStrategyScreen', 
          action: 'select_strategy',
          strategyId: strategy._id,
          strategyName: strategy.name
        }
      });
      // Future implementation will use this strategy to create a new tracking instance
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { 
          component: 'UseStrategyScreen', 
          action: 'select_strategy_error',
          strategyId: strategy._id
        }
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
        context: { action: 'navigate_back_from_use_strategy' }
      });
    }
  };

  // Custom strategy card component with "Use this Strategy!" button
  const StrategySelectionCard = ({ strategy }: { strategy: Strategy }) => {
    return (
      <Card
        containerStyle={styles.cardContainer}
        accessibilityLabel={`Strategy ${strategy.name}`}
        accessibilityHint="Tap to view details about this strategy"
      >
        {/* Render the strategy content */}
        <RNView style={styles.emojiPillContainer}>
          <View style={styles.pillWrapper}>
            <RNText style={styles.emoji}>{strategy.trigger.emoji}</RNText>
            <RNText style={styles.triggerLabel}>{strategy.trigger.label}</RNText>
          </View>
        </RNView>
        
        <RNView style={styles.infoRow}>
          <Text style={styles.strategyName}>{strategy.name}</Text>
        </RNView>
        
        {/* Competing Responses */}
        {strategy.competingResponses && strategy.competingResponses.length > 0 && (
          <RNView style={styles.infoRow}>
            <Text style={styles.infoLabel}>Competing Response:</Text>
            <Text style={styles.infoValue}>
              {strategy.competingResponses[0].title}
              {strategy.competingResponses.length > 1 && 
                ` (${strategy.competingResponses.filter(r => r.isActive).length}/${strategy.competingResponses.length})`}
            </Text>
          </RNView>
        )}
        
        {/* Stimulus Controls */}
        {strategy.stimulusControls && strategy.stimulusControls.length > 0 && (
          <RNView style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stimulus Control:</Text>
            <Text style={styles.infoValue}>
              {strategy.stimulusControls[0].title}
            </Text>
          </RNView>
        )}
        
        {/* Use Strategy Button */}
        <TouchableOpacity
          style={styles.useButton}
          onPress={() => handleSelectStrategy(strategy)}
          activeOpacity={0.7}
          accessibilityLabel={`Use ${strategy.name} Strategy`}
          accessibilityRole="button"
          accessibilityHint={`Select ${strategy.name} strategy for your tracking instance`}
        >
          <Text style={styles.useButtonText}>Use this Strategy!</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <SafeAreaView style={styles.container}>
        <Header 
          title="Select a Strategy" 
          showBackButton 
          onLeftPress={handleBack}
        />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          testID="use-strategy-screen-scroll"
          accessibilityLabel="Use strategy screen"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary.main]}
              tintColor={theme.colors.primary.main}
            />
          }
        >
          {/* Loading State */}
          {loading && !refreshing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary.main} />
              <Text style={styles.loadingText}>Loading strategies...</Text>
            </View>
          )}

          {/* Empty State */}
          {!loading && strategies.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="document-text-outline" 
                size={64} 
                color={theme.colors.neutral.gray} 
              />
              <Text style={styles.emptyTitle}>No Strategies Yet!</Text>
              <Text style={styles.emptyText}>
                Create a strategy first or start fresh
              </Text>
              <TouchableOpacity
                style={styles.goBackButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Text style={styles.goBackButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Strategy List */}
          {!loading && strategies.length > 0 && (
            <View style={styles.strategyList}>
              <Text style={styles.subtitle}>
                Select a strategy to use for your tracking instance
              </Text>
              {strategies.map((strategy) => (
                <StrategySelectionCard 
                  key={strategy._id} 
                  strategy={strategy} 
                />
              ))}
            </View>
          )}
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
  
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    textAlign: 'center',
  } as TextStyle,
  
  loadingContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  } as ViewStyle,
  
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  } as TextStyle,
  
  emptyContainer: {
    flex: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  } as ViewStyle,
  
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  } as TextStyle,
  
  strategyList: {
    flex: 1,
    padding: theme.spacing.sm,
  } as ViewStyle,
  
  cardContainer: {
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
  } as ViewStyle,
  
  emojiPillContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  pillWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  } as ViewStyle,
  
  emoji: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  } as TextStyle,
  
  triggerLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,
  
  strategyName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  
  infoLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
    minWidth: 150,
  } as TextStyle,
  
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    flex: 1,
  } as TextStyle,
  
  useButton: {
    backgroundColor: theme.colors.primary.dark,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  } as ViewStyle,
  
  useButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold as '700',
  } as TextStyle,
  
  goBackButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  } as ViewStyle,
  
  goBackButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold as '700',
  } as TextStyle,
});