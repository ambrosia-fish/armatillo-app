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

  // Fetch strategies from API
  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const data = await strategiesApi.getStrategies();
      setStrategies(data);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        level: 'error',
        source: 'api',
        context: { 
          component: 'StrategiesScreen', 
          method: 'fetchStrategies' 
        }
      });
      Alert.alert(
        'Error',
        'Unable to load strategies. Please try again later.'
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

  // Handle opening modal for creating new strategy
  const handleAddStrategy = () => {
    setSelectedStrategy(undefined);
    setModalVisible(true);
  };

  // Handle opening modal for editing existing strategy
  const handleEditStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setModalVisible(true);
  };

  // Handle saving strategy (create or update)
  const handleSaveStrategy = async (strategy: Partial<Strategy>) => {
    try {
      if (selectedStrategy?._id) {
        // Update existing strategy
        await strategiesApi.updateStrategy(selectedStrategy._id, strategy);
      } else {
        // Create new strategy
        await strategiesApi.createStrategy(strategy);
      }
      
      setModalVisible(false);
      fetchStrategies(); // Refresh strategies list
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        level: 'error',
        source: 'api',
        context: { 
          component: 'StrategiesScreen', 
          method: 'handleSaveStrategy'
        }
      });
      Alert.alert(
        'Error',
        'Failed to save strategy. Please try again.'
      );
    }
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
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddStrategy}
              accessibilityLabel="Add new strategy"
              accessibilityRole="button"
            >
              <Ionicons name="add" size={24} color={theme.colors.primary.main} />
            </TouchableOpacity>
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
                Add your first strategy to manage your triggers and behaviors
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={handleAddStrategy}
                accessibilityLabel="Add your first strategy"
                accessibilityRole="button"
              >
                <Text style={styles.emptyButtonText}>Add Your First Strategy</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Strategy List */}
          {!loading && strategies.length > 0 && (
            <View style={styles.strategyList}>
              {strategies.map((strategy) => (
                <StrategyCard 
                  key={strategy._id} 
                  strategy={strategy} 
                  onPress={() => handleEditStrategy(strategy)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Strategy Modal */}
      <StrategyModal
        visible={modalVisible}
        strategy={selectedStrategy}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveStrategy}
      />
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
    borderRadius: theme.borderRadius.circle,
    backgroundColor: 'rgba(72, 82, 131, 0.1)',
  } as ViewStyle,
  
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
  
  emptyButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
  } as ViewStyle,
  
  emptyButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.primary.contrast,
  } as TextStyle,
  
  strategyList: {
    flex: 1,
    padding: theme.spacing.sm,
  } as ViewStyle,
});