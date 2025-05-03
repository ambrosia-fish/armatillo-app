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
  Text as RNText,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

import theme from '@/app/styles/theme';
import { View, Text, Card, Header, EmojiPill } from '@/app/components';
import { Strategy } from '@/app/components/StrategyCard';
import { strategiesApi } from '@/app/services/api/strategies';
import { errorService } from '@/app/services/error/ErrorService';
import OptionDictionaries, { OptionItem } from '@/app/constants/options';

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
  const handleSelectStrategy = async (strategy: Strategy) => {
    try {
      console.log('Strategy selected:', strategy.name);
      
      // Increment the use count
      await strategiesApi.incrementStrategyUseCount(strategy._id);
      
      // Log success
      console.log(`Incremented use count for strategy: ${strategy.name}`);
      
      // Show success notification
      Alert.alert(
        "Good Job!",
        `You've selected the "${strategy.name}" strategy.`,
        [
          { 
            text: "OK", 
            onPress: () => {
              // Navigate all the way back to home (index)
              router.push('/');
            }
          }
        ]
      );
      
    } catch (error) {
      // Still handle actual errors appropriately
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { 
          component: 'UseStrategyScreen', 
          action: 'select_strategy_error',
          strategyId: strategy._id
        }
      });
      
      // Even if there's an error, try to navigate home
      router.push('/');
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
    // Calculate active responses count
    const activeResponsesCount = strategy.competingResponses?.filter(response => response.isActive)?.length || 0;
    const activeControlsCount = strategy.stimulusControls?.filter(control => control.isActive)?.length || 0;
    const activeSupportsCount = strategy.communitySupports?.filter(support => support.isActive)?.length || 0;
    
    // Ensure trigger is valid
    const validTrigger = strategy.trigger && typeof strategy.trigger === 'object' && strategy.trigger.id ? 
      strategy.trigger : DEFAULT_TRIGGER;
    
    // Dummy function for EmojiPill since we don't need to toggle it in the card
    const handleEmojiPillToggle = () => {};
    
    return (
      <Card
        containerStyle={[
          styles.cardContainer,
          !strategy.isActive && styles.inactiveCard
        ]}
        accessibilityLabel={`Strategy ${strategy.name}`}
        accessibilityHint="View this strategy"
      >
        {/* Header with Title and Status */}
        <RNView style={styles.cardHeader}>
          <RNView style={styles.titleContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>{strategy.name}</Text>
            {strategy.isActive ? (
              <RNView style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={12} color={theme.colors.utility.success} />
                <Text style={styles.statusText}>Active</Text>
              </RNView>
            ) : (
              <RNView style={[styles.statusBadge, styles.inactiveBadge]}>
                <Ionicons name="ellipse-outline" size={12} color={theme.colors.text.tertiary} />
                <Text style={[styles.statusText, styles.inactiveText]}>Inactive</Text>
              </RNView>
            )}
          </RNView>
        </RNView>

        {/* Trigger Row */}
        <RNView style={styles.triggerRow}>
          <RNView style={styles.triggerLabel}>
            <Ionicons 
              name="alert-circle-outline" 
              size={16} 
              color={theme.colors.primary.main} 
              style={styles.triggerIcon} 
            />
            <Text style={styles.triggerText}>Trigger:</Text>
          </RNView>
          <RNView style={styles.emojiPillContainer}>
            <EmojiPill
              id={validTrigger.id}
              label={validTrigger.label}
              emoji={validTrigger.emoji}
              selected={true}
              onToggle={handleEmojiPillToggle}
            />
          </RNView>
        </RNView>
        
        {/* Divider */}
        <RNView style={styles.divider} />
        
        {/* Info Items */}
        <RNView style={styles.infoContainer}>
          {/* Competing Responses */}
          {strategy.competingResponses && strategy.competingResponses.length > 0 && (
            <RNView style={styles.infoItem}>
              <RNView style={styles.infoIconContainer}>
                <Ionicons name="swap-horizontal-outline" size={16} color={theme.colors.primary.main} />
              </RNView>
              <RNView style={styles.infoContent}>
                <Text style={styles.infoItemLabel}>Competing Response:</Text>
                <RNView style={styles.valueRow}>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {strategy.competingResponses[0].title}
                  </Text>
                  {strategy.competingResponses.length > 1 && (
                    <RNView style={styles.countBadge}>
                      <Text style={styles.countText}>
                        {`${activeResponsesCount}/${strategy.competingResponses.length}`}
                      </Text>
                    </RNView>
                  )}
                </RNView>
              </RNView>
            </RNView>
          )}
          
          {/* Stimulus Controls */}
          {strategy.stimulusControls && strategy.stimulusControls.length > 0 && (
            <RNView style={styles.infoItem}>
              <RNView style={styles.infoIconContainer}>
                <Ionicons name="shield-outline" size={16} color={theme.colors.primary.main} />
              </RNView>
              <RNView style={styles.infoContent}>
                <Text style={styles.infoItemLabel}>Stimulus Control:</Text>
                <RNView style={styles.valueRow}>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {strategy.stimulusControls[0].title}
                  </Text>
                  {strategy.stimulusControls.length > 1 && (
                    <RNView style={styles.countBadge}>
                      <Text style={styles.countText}>
                        {`${activeControlsCount}/${strategy.stimulusControls.length}`}
                      </Text>
                    </RNView>
                  )}
                </RNView>
              </RNView>
            </RNView>
          )}
          
          {/* Community Supports */}
          {strategy.communitySupports && strategy.communitySupports.length > 0 && (
            <RNView style={styles.infoItem}>
              <RNView style={styles.infoIconContainer}>
                <Ionicons name="people-outline" size={16} color={theme.colors.primary.main} />
              </RNView>
              <RNView style={styles.infoContent}>
                <Text style={styles.infoItemLabel}>Support:</Text>
                <RNView style={styles.valueRow}>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {strategy.communitySupports[0].name}
                  </Text>
                  {strategy.communitySupports.length > 1 && (
                    <RNView style={styles.countBadge}>
                      <Text style={styles.countText}>
                        {`${activeSupportsCount}/${strategy.communitySupports.length}`}
                      </Text>
                    </RNView>
                  )}
                </RNView>
              </RNView>
            </RNView>
          )}
        </RNView>
        
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
      
      {/* Hide the default navigation header */}
      <Stack.Screen options={{ headerShown: false }} />
      
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
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary.main,
  } as ViewStyle,
  
  inactiveCard: {
    borderLeftColor: theme.colors.text.tertiary,
    opacity: 0.8,
  } as ViewStyle,
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,
  
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
    flex: 1,
  } as TextStyle,
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 181, 67, 0.1)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  } as ViewStyle,
  
  inactiveBadge: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  } as ViewStyle,
  
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.utility.success,
    marginLeft: 2,
  } as TextStyle,
  
  inactiveText: {
    color: theme.colors.text.tertiary,
  } as TextStyle,
  
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  triggerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  } as ViewStyle,
  
  triggerIcon: {
    marginRight: 4,
  },
  
  triggerText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.secondary,
  } as TextStyle,
  
  emojiPillContainer: {
    alignSelf: 'flex-start',
  } as ViewStyle,
  
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  infoContainer: {
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  
  infoItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  
  infoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(82, 130, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  } as ViewStyle,
  
  infoContent: {
    flex: 1,
  } as ViewStyle,
  
  infoItemLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  } as TextStyle,
  
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    flex: 1,
  } as TextStyle,
  
  countBadge: {
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: theme.spacing.xs,
  } as ViewStyle,
  
  countText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.primary.main,
  } as TextStyle,
  
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary.dark,
    borderRadius: theme.borderRadius.sm,
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