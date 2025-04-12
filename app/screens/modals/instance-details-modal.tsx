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
  Dimensions,
  View as RNView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '@/app/services/api';
import OptionDictionaries, { OptionItem } from '@/app/constants/optionDictionaries';
import { ensureValidToken } from '@/app/utils/tokenRefresher';
import Button from '@/app/components/Button';
import { View, Text } from '@/app/components/Themed';
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';
import { Instance } from '@/app/types/Instance';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Type for Ionicons names
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface InstanceDetailsModalProps {
  visible?: boolean;
  isVisible?: boolean; // For backward compatibility
  instanceId: string | null;
  onClose: () => void;
}

/**
 * Modal component to display detailed information about a BFRB instance
 * 
 * @param props - Component properties
 * @returns Rendered modal with instance details
 */
const InstanceDetailsModal: React.FC<InstanceDetailsModalProps> = ({
  visible,
  isVisible, // For backward compatibility
  instanceId,
  onClose
}) => {
  // Support both isVisible (old) and visible (new) props
  const isModalVisible = visible !== undefined ? visible : isVisible || false;
  
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
    if (isModalVisible && instanceId) {
      fadeAnim.setValue(0);
      fetchInstance();
    }
  }, [isModalVisible, instanceId]);

  /**
   * Format date to human-readable string (e.g., Monday, April 7)
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric'
      });
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { component: 'InstanceDetailsModal', action: 'formatDate', date: dateString }
      });
      return 'Invalid date';
    }
  };

  /**
   * Format time to display only hours and minutes (e.g., 7:30 PM)
   */
  const formatTimeOnly = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return "Unknown time";
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
   * Get appropriate icon for different categories
   */
  const getCategoryIcon = (category: string): IoniconsName => {
    switch (category.toLowerCase()) {
      case 'location':
      case 'environment':
        return 'location';
      case 'activity':
        return 'bicycle';
      case 'emotions':
        return 'heart';
      case 'thought patterns':
        return 'cloud';
      case 'physical sensations':
        return 'body';
      case 'sensory triggers':
        return 'flash';
      case 'awareness type':
        return instance?.intentionType === 'automatic' ? 'flash' : 'hand-left';
      case 'urge strength':
        return 'thermometer';
      default:
        return 'information-circle';
    }
  };

  /**
   * Render a pill for a category item
   */
  const renderPill = (text: string, emoji: string, index: number) => (
    <View key={index} style={styles.pill}>
      <Text style={styles.pillText}>
        {emoji} {text}
      </Text>
    </View>
  );

  /**
   * Render the awareness type section
   */
  const renderAwarenessSection = () => {
    if (!instance) return null;
    
    const iconName = instance.intentionType === 'automatic' ? 'flash' : 'hand-left';
    const value = instance.intentionType === 'automatic' ? 'Automatic' : 'Intentional';
    
    return (
      <View style={styles.gridItem}>
        <View style={styles.categoryHeader}>
          <Ionicons name={iconName} size={20} color={theme.colors.primary.main} style={styles.categoryIcon} />
          <Text style={styles.categoryTitle}>Awareness Type</Text>
        </View>
        <View style={styles.awarenessPillContainer}>
          <View style={styles.awarenessPill}>
            <Ionicons name={iconName} size={16} color={theme.colors.primary.main} style={styles.pillIcon} />
            <Text style={styles.pillText}>{value}</Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render the urge strength section with horizontal meter
   */
  const renderUrgeStrengthSection = () => {
    if (!instance) return null;
    
    // Default to 3 if undefined
    const strength = instance.urgeStrength !== undefined ? Number(instance.urgeStrength) : 3;
    
    // Calculate fill percentage from left (1-5 scale)
    const fillPercent = ((strength - 1) / 4) * 100;
    
    return (
      <View style={styles.urgeStrengthSection}>
        <View style={styles.categoryHeader}>
          <Ionicons name="thermometer" size={20} color={theme.colors.primary.main} style={styles.categoryIcon} />
          <Text style={styles.categoryTitle}>Urge Strength</Text>
        </View>
        <View style={styles.urgeContainer}>
          <View style={styles.horizontalUrgeBar}>
            <View 
              style={[
                styles.horizontalUrgeFill, 
                { width: `${fillPercent}%` }
              ]} 
            />
            {/* Scale markers */}
            <View style={[styles.urgeMarker, { left: '0%' }]}>
              <Text style={styles.urgeMarkerText}>1</Text>
            </View>
            <View style={[styles.urgeMarker, { left: '25%' }]}>
              <Text style={styles.urgeMarkerText}>2</Text>
            </View>
            <View style={[styles.urgeMarker, { left: '50%' }]}>
              <Text style={styles.urgeMarkerText}>3</Text>
            </View>
            <View style={[styles.urgeMarker, { left: '75%' }]}>
              <Text style={styles.urgeMarkerText}>4</Text>
            </View>
            <View style={[styles.urgeMarker, { left: '100%' }]}>
              <Text style={styles.urgeMarkerText}>5</Text>
            </View>
            
            {/* Current value marker */}
            {/* <View style={[styles.currentUrgeMarker, { left: `${fillPercent}%` }]}>
              <Text style={styles.currentUrgeText}>{strength}</Text>
            </View> */}
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render a standard category section with pills
   */
  const renderCategorySection = (
    title: string,
    items?: string[],
    optionsList?: OptionItem[],
    iconName?: IoniconsName
  ) => {
    const itemsToRender = items || [];
    const icon = iconName || getCategoryIcon(title);
    
    return (
      <View style={styles.gridItem}>
        <View style={styles.categoryHeader}>
          <Ionicons name={icon} size={20} color={theme.colors.primary.main} style={styles.categoryIcon} />
          <Text style={styles.categoryTitle}>{title}</Text>
        </View>
        <View style={styles.pillsContainer}>
          {itemsToRender.length > 0 ? (
            itemsToRender.map((id, index) => {
              const option = optionsList?.find(opt => opt.id === id) || { label: id, emoji: '📝' };
              return renderPill(option.label, option.emoji, index);
            })
          ) : (
            <Text style={styles.noneText}>None</Text>
          )}
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.centeredContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="document-outline" size={32} color={theme.colors.primary.main} />
      </View>
      <Text style={styles.emptyStateTitle}>No Details Found</Text>
      <Text style={styles.emptyStateText}>The requested information is not available</Text>
    </View>
  );

  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.centeredContainer}>
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
        {/* Date header */}
        <View style={styles.dateHeaderContainer}>
          <Ionicons name="calendar" size={20} color={theme.colors.text.secondary} style={styles.inlineIcon} />
          <Text style={styles.dateHeaderText}>{formatDate(instance.time)}</Text>
        </View>
        
        {/* Time info row */}
        <View style={styles.timeInfoRow}>
          <View style={styles.timeInfoItem}>
            <Ionicons name="time" size={18} color={theme.colors.text.secondary} style={styles.inlineIcon} />
            <Text style={styles.timeInfoText}>{formatTimeOnly(instance.time)}</Text>
          </View>
          
          <View style={styles.timeInfoItem}>
            <Ionicons name="hourglass" size={18} color={theme.colors.text.secondary} style={styles.inlineIcon} />
            <Text style={styles.timeInfoText}>
              {instance.duration} {instance.duration === 1 ? 'min' : 'mins'}
            </Text>
          </View>
        </View>
        
        {/* Urge Strength Section - Now above the grid */}
        {renderUrgeStrengthSection()}
        
        {/* Categories in 3x2 grid layout */}
        <View style={styles.categoriesGrid}>
          {/* Left column */}
          <View style={styles.gridColumn}>
            {renderAwarenessSection()}
            
            {renderCategorySection(
              "Activity", 
              instance.selectedActivities,
              OptionDictionaries.activityOptions,
              "bicycle"
            )}
            
            {renderCategorySection(
              "Thought Patterns", 
              instance.selectedThoughts,
              OptionDictionaries.thoughtOptions,
              "cloud"
            )}
          </View>
          
          {/* Right column */}
          <View style={styles.gridColumn}>
            {renderCategorySection(
              "Location", 
              instance.selectedEnvironments,
              OptionDictionaries.locationOptions || OptionDictionaries.environmentOptions,
              "location"
            )}
            
            {renderCategorySection(
              "Emotions", 
              instance.selectedEmotions,
              OptionDictionaries.emotionOptions,
              "heart"
            )}
            
            {renderCategorySection(
              "Physical Sensations", 
              instance.selectedSensations,
              OptionDictionaries.sensationOptions,
              "body"
            )}
          </View>
        </View>
        
        {/* Notes - always visible */}
        <View style={styles.notesSection}>
          <View style={styles.notesTitleRow}>
            <Ionicons name="document-text" size={20} color={theme.colors.primary.main} style={styles.categoryIcon} />
            <Text style={styles.categoryTitle}>Notes</Text>
          </View>
          <View style={styles.notesContainer}>
            {instance.notes ? (
              <Text style={styles.notesText}>{instance.notes}</Text>
            ) : (
              <Text style={styles.noneText}>No notes for this instance</Text>
            )}
          </View>
        </View>
      </>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={handleClose}
      accessibilityLabel="Instance details modal"
      statusBarTranslucent={true}
    >
      <RNView style={styles.overlay}>
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
                  contentContainerStyle={styles.contentContainer}
                  showsVerticalScrollIndicator={true}
                >
                  {renderInstanceContent()}
                </ScrollView>
              </Animated.View>
            )}
          </View>
        </View>
      </RNView>
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
    height: SCREEN_HEIGHT * 0.8,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  } as ViewStyle,
  headerSpacer: {
    width: 24,
  } as ViewStyle,
  closeButton: {
    padding: 4,
  } as ViewStyle,
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
  } as TextStyle,
  contentWrapper: {
    flex: 1,
  } as ViewStyle,
  animatedContainer: {
    flex: 1,
  } as ViewStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  } as ViewStyle,
  
  // Date header
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  } as ViewStyle,
  dateHeaderText: {
    fontSize: 16,
    fontWeight: '600' as '600',
    color: theme.colors.text.primary,
  } as TextStyle,
  
  // Time info row
  timeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  } as ViewStyle,
  timeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  timeInfoText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  } as TextStyle,
  inlineIcon: {
    marginRight: 6,
  } as ViewStyle,
  
  // Urge Strength Section - New horizontal styles
  urgeStrengthSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  } as ViewStyle,
  urgeContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  } as ViewStyle,
  horizontalUrgeBar: {
    height: 24,
    width: '100%',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: 12,
    overflow: 'visible',
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  } as ViewStyle,
  horizontalUrgeFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.colors.primary.light,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  } as ViewStyle,
  urgeMarker: {
    position: 'absolute',
    top: 28,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -6 }],
  } as ViewStyle,
  urgeMarkerText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  } as TextStyle,
  currentUrgeMarker: {
    position: 'absolute',
    top: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -12 }],
  } as ViewStyle,
  currentUrgeText: {
    fontSize: 12,
    fontWeight: 'bold' as 'bold',
    color: 'white',
  } as TextStyle,
  
  // Grid layout
  categoriesGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  } as ViewStyle,
  gridColumn: {
    flex: 1,
    paddingHorizontal: 4,
  } as ViewStyle,
  gridItem: {
    marginBottom: 16,
  } as ViewStyle,
  
  // Category headers and content
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  categoryIcon: {
    marginRight: 8,
  } as ViewStyle,
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600' as '600',
    color: theme.colors.text.primary,
  } as TextStyle,
  
  // Awareness section
  awarenessPillContainer: {
    alignItems: 'flex-start',
  } as ViewStyle,
  awarenessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary.light + '40',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 4,
  } as ViewStyle,
  pillIcon: {
    marginRight: 4,
  } as ViewStyle,
  
  // Pills
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  } as ViewStyle,
  pill: {
    backgroundColor: theme.colors.primary.light + '40',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 4,
    margin: 2,
    marginBottom: 6,
  } as ViewStyle,
  pillText: {
    fontSize: 14,
    color: theme.colors.primary.main,
    fontWeight: '500' as '500',
  } as TextStyle,
  noneText: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    paddingVertical: 4,
  } as TextStyle,
  
  // Notes section
  notesSection: {
    marginTop: 16,
  } as ViewStyle,
  notesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  notesContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: 'rgba(240, 242, 245, 0.6)',
    minHeight: 60,
  } as ViewStyle,
  notesText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    lineHeight: 20,
  } as TextStyle,
  
  // Empty, Loading, and Error states
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  } as ViewStyle,
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
    fontWeight: 'bold' as 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  } as TextStyle,
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  } as ViewStyle,
  errorText: {
    color: theme.colors.utility.error,
    marginVertical: 12,
    textAlign: 'center',
    fontSize: 14,
  } as TextStyle,
  retryButton: {
    marginTop: 8,
  } as ViewStyle,
});

export default InstanceDetailsModal;