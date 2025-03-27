import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  ViewStyle,
  TextStyle,
  Share,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/services/api';
import { InstanceDetailsModal } from '@/app/components';
import { useFocusEffect } from '@react-navigation/native';
import { ensureValidToken } from '@/app/utils/tokenRefresher';
import theme from '@/app/constants/theme';
import { View, Text } from '@/app/components';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import OptionDictionaries from '@/app/constants/optionDictionaries';

// Define the Instance type based on your backend data structure
interface Instance {
  _id: string;
  userId: string;
  userEmail: string;
  user_id: string;
  createdAt: string;
  urgeStrength?: number;
  intentionType?: string;
  automatic?: boolean;
  location?: string;
  activity?: string;
  duration?: string | number;
  selectedEmotions?: string[];
  selectedEnvironments?: string[];
  selectedSensations?: string[];
  selectedThoughts?: string[];
  feelings?: string[];
  environment?: string[];
  thoughts?: string;
  notes?: string;
}

export default function HistoryScreen() {
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

  // Function to fetch instances from API
  const fetchInstances = async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (!isAuthenticated) {
        console.log('Not authenticated yet, skipping fetch');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Make sure token is valid before making the request
      const tokenRefreshed = await ensureValidToken();
      console.log('Token refresh status:', tokenRefreshed ? 'refreshed' : 'not needed');
      
      // Fetch instances
      console.log('Fetching instances...');
      const response = await api.instances.getInstances();
      console.log('Fetched instances count:', response?.length || 0);
      
      // Check if response is an array
      if (!Array.isArray(response)) {
        console.error('Expected array but got:', typeof response);
        setError('Received invalid response format from server');
        return;
      }
      
      // Sort instances by creation date (newest first)
      const sortedInstances = response.sort((a: Instance, b: Instance) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setInstances(sortedInstances);
    } catch (err) {
      console.error('Error fetching instances:', err);
      
      let errorMessage = 'Failed to load your history. Please try again.';
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

  // Helper function to convert option IDs to readable labels
  const getOptionLabels = (optionIds?: string[], optionList?: any[]) => {
    if (!optionIds || !optionList) return '';
    
    return optionIds.map(id => {
      const option = optionList.find(opt => opt.id === id);
      return option ? option.label : id;
    }).join(', ');
  };

  // Function to convert instances to CSV format
  const convertToCSV = (data: Instance[]) => {
    // Define CSV headers
    const headers = [
      'Date',
      'Urge Strength',
      'Type',
      'Duration',
      'Location',
      'Activity',
      'Emotions',
      'Physical Sensations',
      'Thoughts',
      'Environment',
      'Notes'
    ];

    // Create CSV content starting with headers
    let csvContent = headers.join(',') + '\n';

    // Add data rows
    data.forEach(instance => {
      // Get type (intentionType is the new field, automatic is the legacy field)
      const type = instance.intentionType 
        ? (instance.intentionType === 'automatic' ? 'Automatic' : 'Intentional')
        : (instance.automatic !== undefined ? (instance.automatic ? 'Automatic' : 'Deliberate') : '');
        
      // Format duration
      const duration = instance.duration 
        ? (typeof instance.duration === 'number' ? `${instance.duration} min` : instance.duration) 
        : '';
        
      // Get emotions labels
      const emotions = instance.selectedEmotions 
        ? getOptionLabels(instance.selectedEmotions, OptionDictionaries.emotionOptions)
        : (instance.feelings ? instance.feelings.join(', ') : '');
        
      // Get environment labels
      const environment = instance.selectedEnvironments 
        ? getOptionLabels(instance.selectedEnvironments, OptionDictionaries.environmentOptions)
        : (instance.environment ? instance.environment.join(', ') : '');
        
      // Get sensation labels (new field, no legacy equivalent)
      const sensations = instance.selectedSensations 
        ? getOptionLabels(instance.selectedSensations, OptionDictionaries.sensationOptions)
        : '';
        
      // Get thought labels
      const thoughts = instance.selectedThoughts 
        ? getOptionLabels(instance.selectedThoughts, OptionDictionaries.thoughtOptions)
        : (instance.thoughts || '');

      // Function to escape quotes and handle fields
      const escapeField = (field: any) => {
        if (field === undefined || field === null || field === '') return '';
        const stringField = String(field);
        return `"${stringField.replace(/"/g, '""')}"`;
      };

      // Create row with proper data types and escaped quotes
      const row = [
        new Date(instance.createdAt).toLocaleString(), // Date
        instance.urgeStrength !== undefined ? instance.urgeStrength : '', // Urge Strength
        escapeField(type), // Type
        escapeField(duration), // Duration
        escapeField(instance.location), // Location
        escapeField(instance.activity), // Activity
        escapeField(emotions), // Emotions
        escapeField(sensations), // Physical Sensations
        escapeField(thoughts), // Thoughts
        escapeField(environment), // Environment
        escapeField(instance.notes) // Notes
      ];
      
      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  };

  // Function to export instances as CSV
  const exportInstancesAsCSV = async () => {
    try {
      if (instances.length === 0) {
        Alert.alert('No Data', 'There is no history data to export.');
        return;
      }

      setExportLoading(true);
      console.log('Starting CSV export with', instances.length, 'instances');

      // Convert instances to CSV format
      const csvContent = convertToCSV(instances);
      
      // Generate file name with current date
      const fileName = `armatillo_history_${new Date().toISOString().split('T')[0]}.csv`;
      
      if (Platform.OS === 'web') {
        // For web: create a download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile: save file and share
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8
        });
        
        // Check if sharing is available
        const isSharingAvailable = await Sharing.isAvailableAsync();
        
        if (isSharingAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Tracking History',
            UTI: 'public.comma-separated-values-text'
          });
        } else {
          // Fallback to Share API if Sharing is not available
          await Share.share({
            title: 'Armatillo History Data',
            message: 'Armatillo History Data: ' + csvContent
          });
        }
      }
      
      console.log('CSV export completed');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      Alert.alert(
        'Export Failed',
        'Could not export data. Please try again later.'
      );
    } finally {
      setExportLoading(false);
    }
  };

  // Only load instances when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchInstances();
      } else {
        console.log('Not authenticated, waiting before fetching instances');
      }
      // Clean up function (optional)
      return () => {
        // Any cleanup code if needed
      };
    }, [isAuthenticated])
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInstances();
  };

  // Format date for display
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

  // Navigate to detail view
  const viewInstanceDetails = (instance: Instance) => {
    setSelectedInstanceId(instance._id);
    setModalVisible(true);
  };

  // Close the modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedInstanceId(null);
  };

  // Render each instance item
  const renderItem = ({ item }: { item: Instance }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => viewInstanceDetails(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </View>
      
      <View style={styles.cardContent}>
        {item.urgeStrength !== undefined && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Urge Strength:</Text>
            <Text style={styles.infoValue}>{item.urgeStrength}/10</Text>
          </View>
        )}
        
        {(item.intentionType !== undefined || item.automatic !== undefined) && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>
              {item.intentionType 
                ? (item.intentionType === 'automatic' ? 'Automatic' : 'Intentional')
                : (item.automatic ? 'Automatic' : 'Deliberate')
              }
            </Text>
          </View>
        )}
        
        {item.location && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{item.location}</Text>
          </View>
        )}
        
        {item.activity && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Activity:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{item.activity}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time-outline" size={50} color={theme.colors.neutral.medium} />
      <Text style={styles.emptyStateText}>No history found</Text>
      <Text style={styles.emptyStateSubtext}>
        Your tracked behaviors will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>History</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchInstances}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {loading && initialLoad ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Loading your history...</Text>
        </View>
      ) : (
        <FlatList
          data={instances}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={instances.length === 0 ? { flex: 1 } : { paddingBottom: theme.spacing.xxl }}
          ListEmptyComponent={!loading ? EmptyState : null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary.main]}
            />
          }
          ListHeaderComponent={loading && !initialLoad ? (
            <View style={styles.inlineLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary.main} />
              <Text style={styles.inlineLoadingText}>Refreshing...</Text>
            </View>
          ) : null}
        />
      )}
      
      {/* Export CSV Button */}
      <View style={styles.exportButtonContainer}>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={exportInstancesAsCSV}
          disabled={loading || refreshing || exportLoading || instances.length === 0}
        >
          {exportLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary.contrast} />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color={theme.colors.primary.contrast} />
              <Text style={styles.exportButtonText}>Export as CSV</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Instance Details Modal */}
      <InstanceDetailsModal 
        isVisible={modalVisible}
        instanceId={selectedInstanceId}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
  } as ViewStyle,
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.text.primary,
  } as TextStyle,
  card: {
    ...theme.componentStyles.card.container,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    paddingBottom: theme.spacing.sm,
  } as ViewStyle,
  date: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,
  cardContent: {
    marginTop: theme.spacing.xs,
  } as ViewStyle,
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  } as ViewStyle,
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium as '500',
    marginRight: theme.spacing.sm,
    minWidth: 100,
  } as TextStyle,
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
  } as TextStyle,
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  } as ViewStyle,
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    marginTop: theme.spacing.lg,
    color: theme.colors.text.secondary,
  } as TextStyle,
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  } as TextStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  } as TextStyle,
  inlineLoadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  inlineLoadingText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.text.secondary,
  } as TextStyle,
  errorContainer: {
    backgroundColor: theme.colors.utility.error + '15', // Using error color with opacity
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  } as ViewStyle,
  errorText: {
    color: theme.colors.utility.error,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  } as TextStyle,
  retryButton: {
    backgroundColor: theme.colors.utility.error,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xs,
  } as ViewStyle,
  retryButtonText: {
    color: theme.colors.neutral.white,
    fontWeight: theme.typography.fontWeight.bold as '700',
  } as TextStyle,
  exportButtonContainer: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.sm,
  } as ViewStyle,
  exportButton: {
    backgroundColor: theme.colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  } as ViewStyle,
  exportButtonText: {
    color: theme.colors.primary.contrast,
    fontWeight: theme.typography.fontWeight.medium as '500',
    marginLeft: theme.spacing.sm,
  } as TextStyle,
});