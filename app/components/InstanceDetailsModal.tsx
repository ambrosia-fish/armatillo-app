import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextStyle,
  ViewStyle,
  Animated,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '@/app/services/api';
import OptionDictionaries, { OptionItem } from '@/app/constants/optionDictionaries';
import { ensureValidToken } from '@/app/utils/tokenRefresher';
import { Button, View, Text } from '@/app/components';
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';
import { Instance } from '@/app/types/Instance';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Type for Ionicons names
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface InstanceDetailsModalProps {
  isVisible: boolean;
  instanceId: string | null;
  onClose: () => void;
}

/**
 * Modal component to display detailed information about a BFRB instance
 * with a modern, sleek design
 * 
 * @param props - Component properties
 * @returns Rendered modal with instance details
 */
const InstanceDetailsModal: React.FC<InstanceDetailsModalProps> = ({
  isVisible,
  instanceId,
  onClose
}) => {
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  /**
   * Handle modal close with error handling
   */
  const handleClose = () => {
    try {
      onClose();
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { component: 'InstanceDetailsModal', action: 'close' }
      });
    }
  };

  /**
   * Fetch instance details from API
   */
  const fetchInstance = async () => {
    if (!instanceId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await ensureValidToken();
      const data = await api.instances.getInstance(instanceId);
      
      // Normalize instance data to standardized format
      const normalizedData: Instance = {
        ...data,
        // Ensure time field exists (use createdAt as fallback)
        time: data.time || data.createdAt,
        // Ensure intentionType exists
        intentionType: data.intentionType || (data.automatic !== undefined 
          ? (data.automatic ? 'automatic' : 'intentional') 
          : 'automatic'),
        // Ensure duration exists
        duration: data.duration || 5,
      };
      
      setInstance(normalizedData);
      
      // Animate content in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
    } catch (err) {
      const errorMessage = 'Failed to load instance details';
      setError(errorMessage);
      
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'api',
        context: { 
          component: 'InstanceDetailsModal', 
          action: 'fetchInstance',
          instanceId 
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch instance details when modal becomes visible
  useEffect(() => {
    if (isVisible && instanceId) {
      fadeAnim.setValue(0);
      fetchInstance();
    }
  }, [isVisible, instanceId]);

  /**
   * Format date to human-readable string
   * 
   * @param date - ISO date string
   * @returns Formatted date string
   */
  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { component: 'InstanceDetailsModal', action: 'formatDate', date }
      });
      return 'Invalid date';
    }
  };

  /**
   * Handle retry when there's an error
   */
  const handleRetry = () => {
    try {
      setError(null);
      fetchInstance();
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { component: 'InstanceDetailsModal', action: 'retry' }
      });
    }
  };

  /**
   * Render a tag with emoji and label
   */
  const renderTag = (emoji: string, label: string, key: number) => (
    <View key={key} style={styles.tag}>
      <Text style={styles.tagText}>
        {emoji} {label}
      </Text>
    </View>
  );

  /**
   * Render items with emojis from the options list
   * 
   * @param items - Array of selected item IDs
   * @param optionsList - List of available options with emojis
   * @returns Rendered list of items with emojis
   */
  const renderItems = (items?: string[], optionsList?: OptionItem[]) => {
    if (!items?.length || !optionsList) {
      return <Text style={styles.emptyValue}>None</Text>;
    }
    
    return (
      <View style={styles.tagContainer}>
        {items.map((id, index) => {
          const option = optionsList.find(opt => opt.id === id) || { label: id, emoji: '📝' };
          return renderTag(option.emoji, option.label, index);
        })}
      </View>
    );
  };

  /**
   * Render section divider
   */
  const renderDivider = () => <View style={styles.divider} />;

  /**
   * Render content section with title
   */
  const renderSection = (title: string, content: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {content}
    </View>
  );

  /**
   * Render a label-value pair
   */
  const renderDetail = (label: string, value: string | number) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.centeredContent}>
      <View style={styles.iconContainer}>
        <Ionicons name="document-outline" size={32} color={theme.colors.primary.main} />
      </View>
      <Text style={styles.emptyStateTitle}>No Details Found</Text>
      <Text style={styles.emptyStateText}>The requested information is not available</Text>
    </View>
  );

  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.centeredContent}>
      <ActivityIndicator size="large" color={theme.colors.primary.main} />
      <Text style={styles.loadingText}>Loading details...</Text>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={32} color={theme.colors.utility.error} />
      <Text style={styles.errorText}>{error}</Text>
      <Button
        title="Retry"
        variant="primary"
        onPress={handleRetry}
        style={styles.retryButton}
      />
    </View>
  );

  // Render the instance details content
  const renderInstanceContent = () => {
    if (!instance) return null;
    
    return (
      <>
        {/* When */}
        <Text style={styles.dateText}>{formatDate(instance.time)}</Text>
        
        {renderDetail("Duration", `${instance.duration} min`)}
        
        {renderDivider()}
        
        {/* BFRB Details */}
        {renderSection("BFRB Details", (
          <>
            {instance.urgeStrength !== undefined && 
              renderDetail("Urge Strength", `${instance.urgeStrength}/10`)}
            
            {renderDetail("Type", 
              instance.intentionType === 'automatic' ? 'Automatic' : 'Intentional')}
          </>
        ))}
        
        {renderDivider()}
        
        {/* Environment */}
        {renderSection("Environment", 
          renderItems(instance.selectedEnvironments, OptionDictionaries.environmentOptions)
        )}
        
        {renderDivider()}
        
        {/* Emotions */}
        {renderSection("Emotions", 
          renderItems(instance.selectedEmotions, OptionDictionaries.emotionOptions)
        )}
        
        {renderDivider()}
        
        {/* Physical Sensations */}
        {renderSection("Physical Sensations", 
          renderItems(instance.selectedSensations, OptionDictionaries.sensationOptions)
        )}
        
        {renderDivider()}
        
        {/* Thoughts */}
        {renderSection("Thoughts", 
          renderItems(instance.selectedThoughts, OptionDictionaries.thoughtOptions)
        )}
        
        {/* Sensory Triggers */}
        {instance.selectedSensoryTriggers && instance.selectedSensoryTriggers.length > 0 && (
          <>
            {renderDivider()}
            {renderSection("Sensory Triggers", 
              renderItems(instance.selectedSensoryTriggers, OptionDictionaries.triggerOptions)
            )}
          </>
        )}
        
        {/* Notes */}
        {instance.notes && (
          <>
            {renderDivider()}
            {renderSection("Notes", 
              <Text style={styles.notesText}>{instance.notes}</Text>
            )}
          </>
        )}
        
        {/* Add bottom space */}
        <View style={styles.bottomSpace} />
      </>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
      accessibilityLabel="Instance details modal"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Instance Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Main content */}
          <View style={styles.contentWrapper}>
            {loading ? renderLoadingState() : 
            error ? renderErrorState() : 
            !instance ? renderEmptyState() : (
              <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
                <ScrollView 
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  {renderInstanceContent()}
                </ScrollView>
              </Animated.View>
            )}
          </View>
        </View>
      </View>
      <StatusBar style="dark" />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as ViewStyle,
  modalContainer: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: theme.colors.background.primary,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.colors.neutral.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  headerSpacer: {
    width: 24,
  } as ViewStyle,
  closeButton: {
    padding: 4,
  } as ViewStyle,
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  } as TextStyle,
  contentWrapper: {
    flex: 1,
    flexGrow: 1,
    height: "100%",
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  animatedContainer: {
    flex: 1,
    flexGrow: 1,
  } as ViewStyle,
  scrollView: {
    flex: 1,
    flexGrow: 1,
  } as ViewStyle,
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  } as ViewStyle,
  section: {
    marginBottom: 16,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  } as TextStyle,
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 16,
  } as ViewStyle,
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  detailLabel: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  } as TextStyle,
  detailValue: {
    fontSize: 15,
    color: theme.colors.text.primary,
    fontWeight: '400',
    textAlign: 'right',
  } as TextStyle,
  dateText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    marginBottom: 8,
  } as TextStyle,
  notesText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    lineHeight: 21,
  } as TextStyle,
  centeredContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.primary,
    flex: 1,
  } as ViewStyle,
  loadingText: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginTop: 16,
  } as TextStyle,
  errorContainer: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(214, 106, 106, 0.08)',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  } as ViewStyle,
  errorText: {
    fontSize: 15,
    color: theme.colors.utility.error,
    marginVertical: 12,
    textAlign: 'center',
  } as TextStyle,
  retryButton: {
    marginTop: 8,
  } as ViewStyle,
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  } as ViewStyle,
  tag: {
    backgroundColor: 'rgba(107, 116, 160, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  } as ViewStyle,
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary.main,
  } as TextStyle,
  emptyValue: {
    fontSize: 15,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  } as TextStyle,
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.primary.main}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  } as TextStyle,
  emptyStateText: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  bottomSpace: {
    height: 20,
  } as ViewStyle,
});

export default InstanceDetailsModal;