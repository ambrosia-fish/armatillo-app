import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import InstanceDetailsModal from '../components/InstanceDetailsModal';

// Define the Instance type based on your backend data structure
interface Instance {
  _id: string;
  userId: string;
  createdAt: string;
  urgeStrength?: number;
  automatic?: boolean;
  location?: string;
  activity?: string;
  feelings?: string[];
  thoughts?: string;
  environment?: string[];
  notes?: string;
}

export default function HistoryScreen() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state management
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  
  const { isAuthenticated, refreshTokenIfNeeded } = useAuth();

  // Function to fetch instances from API
  const fetchInstances = async () => {
    try {
      setError(null);
      
      // Make sure token is valid before making the request
      await refreshTokenIfNeeded();
      
      // Fetch instances
      const response = await api.instances.getInstances();
      
      // Sort instances by creation date (newest first)
      const sortedInstances = response.sort((a: Instance, b: Instance) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setInstances(sortedInstances);
    } catch (err) {
      console.error('Error fetching instances:', err);
      setError('Failed to load your history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load instances when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchInstances();
    }
  }, [isAuthenticated]);

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
        <Ionicons name="chevron-forward" size={20} color="#777" />
      </View>
      
      <View style={styles.cardContent}>
        {item.urgeStrength !== undefined && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Urge Strength:</Text>
            <Text style={styles.infoValue}>{item.urgeStrength}/10</Text>
          </View>
        )}
        
        {item.automatic !== undefined && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{item.automatic ? 'Automatic' : 'Deliberate'}</Text>
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
      <Ionicons name="time-outline" size={50} color="#ccc" />
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
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading your history...</Text>
        </View>
      ) : (
        <FlatList
          data={instances}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={instances.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      )}
      
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
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cardContent: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    marginRight: 8,
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#666',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
