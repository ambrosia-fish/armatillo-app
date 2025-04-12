import React, { useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
  TextStyle,
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/services/api';
import { InstanceDetailsModal } from '@/app/components';
import { useFocusEffect } from '@react-navigation/native';
import { ensureValidToken } from '@/app/utils/tokenRefresher';
import { exportInstancesAsCSV } from '@/app/utils/csvExport';
import { Instance, normalizeInstance } from '@/app/types/Instance';
import theme from '@/app/constants/theme';
import { View, Text } from '@/app/components';

/**
 * Progress screen showing all tracked BFRB instances with a modern UI
 */
export default function ProgressScreen() {
  // State management
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Modal state management
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  
  const { isAuthenticated, user } = useAuth();
  
  // Log auth state for debugging
  useEffect(() => {
    console.log('ProgressScreen: Auth status:', isAuthenticated);
    if (user) {
      console.log('ProgressScreen: User:', user.displayName, user.email);
    }
  }, [isAuthenticated, user]);

  /**
   * Fetch instances from the API
   */
  const fetchInstances = async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (!isAuthenticated) {
        console.log('ProgressScreen: Not authenticated, skipping fetch');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log('ProgressScreen: Fetching instances...');
      
      // Make sure token is valid before making the request
      await ensureValidToken();
      
      // Fetch instances
      const response = await api.instances.getInstances();
      
      // Check if response is an array
      if (!Array.isArray(response)) {
        const errorMessage = 'Received invalid response format from server';
        console.error('ProgressScreen: Invalid response format:', response);
        setError(errorMessage);
        return;
      }
      
      console.log(`ProgressScreen: Fetched ${response.length} instances`);
      
      // Normalize and sort instances by time (newest first)
      const normalizedInstances = response.map(normalizeInstance);
      const sortedInstances = normalizedInstances.sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      
      setInstances(sortedInstances);
    } catch (err) {
      console.error('ProgressScreen: Error fetching instances:', err);
      
      let errorMessage = 'Failed to load your progress data. Please try again.';
      if (err instanceof Error) {
        errorMessage += '\n\nDetails: ' + err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoad(false);
    }
  };

  /**
   * Handle CSV export of instances
   */
  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      console.log('ProgressScreen: Exporting instances to CSV...');
      await exportInstancesAsCSV(instances);
      console.log('ProgressScreen: CSV export completed');
    } catch (err) {
      console.error('ProgressScreen: Error exporting to CSV:', err);
    } finally {
      setExportLoading(false);
    }
  };

  // Load instances when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('ProgressScreen: Screen focused, refreshing data');
      if (isAuthenticated) {
        fetchInstances();
      }
      return () => {
        console.log('ProgressScreen: Screen unfocused');
      };
    }, [isAuthenticated])
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    console.log('ProgressScreen: Pull-to-refresh triggered');
    setRefreshing(true);
    await fetchInstances();
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Navigate to detail view
   */
  const viewInstanceDetails = (instance: Instance) => {
    try {
      console.log('ProgressScreen: Opening details for instance:', instance._id);
      setSelectedInstanceId(instance._id);
      setModalVisible(true);
    } catch (err) {
      console.error('ProgressScreen: Error viewing details:', err);
    }
  };

  /**
   * Close the modal
   */
  const closeModal = () => {
    console.log('ProgressScreen: Closing details modal');
    setModalVisible(false);
    setSelectedInstanceId(null);
  };

  /**
   * Render each instance item with modern styling
   */
  const renderItem = ({ item }: { item: Instance }) => (
    <TouchableOpacity 
      style={styles.instanceCard}
      onPress={() => viewInstanceDetails(item)}
      activeOpacity={0.7}
      accessibilityLabel={`Entry from ${formatDate(item.time)}`}
      accessibilityHint="Double tap to view details"
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.text.tertiary} />
          <Text style={styles.dateText}>{formatDate(item.time)}</Text>
        </View>
        <View style={styles.typeChip}>
          <Text style={styles.typeText}>
            {item.intentionType === 'automatic' ? 'Automatic' : 'Intentional'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        {item.urgeStrength !== undefined && (
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="pulse-outline" size={18} color={theme.colors.text.tertiary} />
            </View>
            <Text style={styles.infoLabel}>Urge Strength:</Text>
            <Text style={styles.infoValue}>{item.urgeStrength}/10</Text>
          </View>
        )}
        
        {item.location && (
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="location-outline" size={18} color={theme.colors.text.tertiary} />
            </View>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{item.location}</Text>
          </View>
        )}
        
        {item.activity && (
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="body-outline" size={18} color={theme.colors.text.tertiary} />
            </View>
            <Text style={styles.infoLabel}>Activity:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{item.activity}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.primary.main} />
      </View>
    </TouchableOpacity>
  );

  /**
   * Empty state component - modern design
   */
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIconContainer}>
        <Ionicons name="analytics-outline" size={40} color={theme.colors.text.tertiary} />
      </View>
      <Text style={styles.emptyStateTitle}>No progress data yet</Text>
      <Text style={styles.emptyStateMessage}>
        Tracked behaviors will appear here to help you monitor your progress
      </Text>
    </View>
  );

  /**
   * Error state component - modern design
   */
  const ErrorState = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Ionicons name="alert-circle-outline" size={24} color={theme.colors.utility.error} />
      </View>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={fetchInstances}
        accessibilityLabel="Try again button"
        accessibilityHint="Double tap to try loading data again"
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <View style={styles.outerContainer}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Progress</Text>
          </View>
          
          {error && <ErrorState />}
          
          {loading && initialLoad ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingIndicator}>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
              </View>
              <Text style={styles.loadingText}>Loading your progress data...</Text>
            </View>
          ) : (
            <FlatList
              data={instances}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={[
                styles.listContainer,
                instances.length === 0 && styles.emptyListContainer
              ]}
              ListEmptyComponent={!loading ? EmptyState : null}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.colors.primary.main]}
                  tintColor={theme.colors.primary.main}
                />
              }
              ListHeaderComponent={loading && !initialLoad ? (
                <View style={styles.refreshingIndicator}>
                  <ActivityIndicator size="small" color={theme.colors.primary.main} />
                  <Text style={styles.refreshingText}>Refreshing...</Text>
                </View>
              ) : null}
              showsVerticalScrollIndicator={false}
            />
          )}
          
          {/* Export Button */}
          {instances.length > 0 && (
            <View style={styles.floatingButtonContainer}>
              <TouchableOpacity 
                style={styles.exportButton}
                onPress={handleExportCSV}
                disabled={loading || refreshing || exportLoading || instances.length === 0}
                activeOpacity={0.8}
                accessibilityLabel="Export to CSV button"
                accessibilityHint="Double tap to export data to CSV file"
              >
                {exportLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.primary.contrast} />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={18} color={theme.colors.primary.contrast} />
                    <Text style={styles.exportButtonText}>Export CSV</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
          
          {/* Instance Details Modal */}
          <InstanceDetailsModal 
            isVisible={modalVisible}
            instanceId={selectedInstanceId}
            onClose={closeModal}
          />
        </SafeAreaView>
      </View>
    </>
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
  
  header: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
  } as TextStyle,
  
  listContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl * 2,
  } as ViewStyle,
  
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  } as ViewStyle,
  
  instanceCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.neutral.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  } as ViewStyle,
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  } as ViewStyle,
  
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  dateText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  } as TextStyle,
  
  typeChip: {
    backgroundColor: 'rgba(72, 82, 131, 0.1)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs/2,
    borderRadius: theme.borderRadius.sm,
  } as ViewStyle,
  
  typeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,
  
  cardBody: {
    padding: theme.spacing.lg,
  } as ViewStyle,
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(72, 82, 131, 0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  } as ViewStyle,
  
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    width: 90,
  } as TextStyle,
  
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium as '500',
    flex: 1,
  } as TextStyle,
  
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: 'rgba(72, 82, 131, 0.02)',
  } as ViewStyle,
  
  viewDetailsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary.main,
    marginRight: theme.spacing.xs,
  } as TextStyle,
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  } as ViewStyle,
  
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(72, 82, 131, 0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  
  emptyStateMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  } as TextStyle,
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  } as ViewStyle,
  
  loadingIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(72, 82, 131, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  } as TextStyle,
  
  refreshingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  
  refreshingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  } as TextStyle,
  
  // Error state
  errorContainer: {
    margin: theme.spacing.lg,
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
    marginBottom: theme.spacing.lg,
    fontSize: theme.typography.fontSize.md,
  } as TextStyle,
  
  retryButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  } as ViewStyle,
  
  retryButtonText: {
    color: theme.colors.primary.contrast,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,
  
  // Export button
  floatingButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? theme.spacing.xxl : theme.spacing.lg,
    right: theme.spacing.lg,
    shadowColor: theme.colors.neutral.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  } as ViewStyle,
  
  exportButton: {
    backgroundColor: theme.colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  } as ViewStyle,
  
  exportButtonText: {
    color: theme.colors.primary.contrast,
    fontWeight: theme.typography.fontWeight.medium as '500',
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
  } as TextStyle,
});