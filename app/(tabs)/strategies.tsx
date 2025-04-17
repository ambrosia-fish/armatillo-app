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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/app/constants/theme';
import { View, Text } from '@/app/components';
import StrategyCard, { Strategy } from '@/app/components/StrategyCard';
import StrategyModal from '@/app/screens/modals/strategy-modal';
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
 * Strategies Screen Component
 * Displays user's triggers and corresponding strategies
 */
export default function StrategiesScreen() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | undefined>(undefined);

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
          component: 'StrategiesScreen', 
          method: 'fetchStrategies' 
        }
      });
      
      // If API fails, show some demo data for development
      const demoStrategies = [
        {
          _id: '1',
          name: 'Work Stress Strategy',
          trigger: OptionDictionaries.emotionOptions.find(o => o.id === 'stressed') || {
            id: 'stressed',
            label: 'Stressed',
            emoji: '😥'
          },
          isActive: true,
          competingResponses: [
            {
              _id: '101',
              title: 'Take a 5-minute break',
              isActive: true
            },
            {
              _id: '102',
              title: 'Deep breathing exercise',
              isActive: true
            }
          ],
          stimulusControls: [
            {
              _id: '201',
              title: 'Wear stress ball',
              isActive: true
            }
          ],
          communitySupports: [
            {
              _id: '301',
              name: 'John (Coworker)',
              isActive: true
            }
          ],
          notifications: [],
          user_id: 'user1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '2',
          name: 'Driving Anxiety',
          trigger: OptionDictionaries.locationOptions.find(o => o.id === 'car') || {
            id: 'car',
            label: 'Car',
            emoji: '🚗'
          },
          isActive: false,
          competingResponses: [
            {
              _id: '103',
              title: 'Listen to calming music',
              isActive: true
            }
          ],
          stimulusControls: [
            {
              _id: '202',
              title: 'Band-Aids',
              isActive: true
            }
          ],
          communitySupports: [
            {
              _id: '302',
              name: 'Sammy',
              isActive: true
            }
          ],
          notifications: [],
          user_id: 'user1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      setStrategies(demoStrategies);
      
      Alert.alert(
        'Demo Mode',
        'Using demo data since the API is not available.'
      );
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

  // Handle view strategy
  const handleViewStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setModalVisible(true);
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <SafeAreaView style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          testID="strategies-screen-scroll"
          accessibilityLabel="Strategies screen"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary.main]}
              tintColor={theme.colors.primary.main}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Strategies</Text>
          </View>

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
              <Text style={styles.emptyTitle}>No Strategies Yet</Text>
              <Text style={styles.emptyText}>
                No strategies have been created yet
              </Text>
            </View>
          )}

          {/* Strategy List */}
          {!loading && strategies.length > 0 && (
            <View style={styles.strategyList}>
              {strategies.map((strategy) => (
                <StrategyCard 
                  key={strategy._id} 
                  strategy={strategy} 
                  onPress={() => handleViewStrategy(strategy)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Strategy Modal */}
      {selectedStrategy && (
        <StrategyModal
          visible={modalVisible}
          strategy={selectedStrategy}
          onClose={() => setModalVisible(false)}
        />
      )}
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
});