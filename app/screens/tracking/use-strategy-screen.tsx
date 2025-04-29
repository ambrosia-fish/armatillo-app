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