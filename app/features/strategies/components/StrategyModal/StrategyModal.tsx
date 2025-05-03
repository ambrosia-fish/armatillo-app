import React, { useEffect } from 'react';
import {
  StyleSheet,
  ViewStyle,
  TextStyle,
  ScrollView,
  Platform,
  View as RNView,
  Modal as RNModal,
  TouchableOpacity,
  Animated,
  BackHandler,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Button, EmojiPill } from '@/app/components';
import theme from '@/app/styles/theme';
import { Strategy, CompetingResponse, StimulusControl, CommunitySupport } from '@/app/components/StrategyCard';

// Default trigger to use when none is provided
const DEFAULT_TRIGGER = {
  id: 'unknown',
  label: 'Unknown',
  emoji: '❓'
};

interface StrategyModalProps {
  visible: boolean;
  strategy?: Strategy;
  onClose: () => void;
}

const StrategyModal: React.FC<StrategyModalProps> = ({
  visible,
  strategy,
  onClose,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
  
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });
    
    return () => backHandler.remove();
  }, [visible, onClose]);
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!strategy) return null;

  // Ensure all arrays exist to prevent crashes
  const competingResponses = strategy.competingResponses || [];
  const stimulusControls = strategy.stimulusControls || [];
  const communitySupports = strategy.communitySupports || [];
  
  // Ensure trigger is valid
  const validTrigger = strategy.trigger && typeof strategy.trigger === 'object' && strategy.trigger.id ? 
    strategy.trigger : DEFAULT_TRIGGER;
    
  // Get title from name or trigger label
  const title = strategy.name || (validTrigger ? validTrigger.label : 'Strategy');

  const renderSection = (title: string, icon: string, content: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name={icon}
          size={20}
          color={theme.colors.primary.main}
        />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {content}
    </View>
  );

  const renderCompetingResponseItem = (item: CompetingResponse) => (
    <View key={item._id} style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      {item.action && <Text style={styles.itemNotes}>{item.action}</Text>}
    </View>
  );

  const renderStimulusControlItem = (item: StimulusControl) => (
    <View key={item._id} style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      {item.action && <Text style={styles.itemNotes}>{item.action}</Text>}
    </View>
  );

  const renderEmptyMessage = (message: string) => (
    <Text style={styles.emptyText}>{message}</Text>
  );

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[styles.overlay, { opacity: fadeAnim }]}
      >
        <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      
      <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.modalContent}>
          <View style={styles.customHeader}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={0}>{title}</Text>
          </View>
          
          <ScrollView
            showsVerticalScrollIndicator={Platform.OS !== 'web'}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.headerSpacing} />
            
            {renderSection('Trigger', 'alert-circle-outline', 
              <View style={styles.pillWrapper}>
                <View style={styles.pillContainer}>
                  <EmojiPill
                    id={validTrigger.id}
                    label={validTrigger.label}
                    emoji={validTrigger.emoji}
                    selected={true}
                    onToggle={() => {}}
                  />
                </View>
              </View>
            )}

            {strategy.description && renderSection('Description', 'information-circle-outline',
              <View style={styles.itemContainer}>
                <Text style={styles.sectionContent}>{strategy.description}</Text>
              </View>
            )}

            {renderSection('Competing Responses', 'swap-horizontal-outline',
              competingResponses.length > 0 
                ? competingResponses.map(renderCompetingResponseItem)
                : renderEmptyMessage('No competing responses added')
            )}

            {renderSection('Stimulus Controls', 'shield-outline',
              stimulusControls.length > 0 
                ? stimulusControls.map(renderStimulusControlItem)
                : renderEmptyMessage('No stimulus controls added')
            )}

            {renderSection('Community Supports', 'people-outline',
              communitySupports.length > 0 
                ? communitySupports.map((support: CommunitySupport) => (
                    <View key={support._id} style={styles.itemContainer}>
                      <Text style={styles.itemTitle}>{support.name}</Text>
                      <View style={styles.supportDetails}>
                        {support.relationship && (
                          <Text style={styles.supportDetail}>
                            <Text style={styles.supportLabel}>Relationship: </Text>
                            {support.relationship}
                          </Text>
                        )}
                        {support.contactInfo && (
                          <Text style={styles.supportDetail}>
                            <Text style={styles.supportLabel}>Contact: </Text>
                            {support.contactInfo}
                          </Text>
                        )}
                        {support.action && <Text style={styles.itemNotes}>{support.action}</Text>}
                      </View>
                    </View>
                  ))
                : renderEmptyMessage('No community supports added')
            )}
          </ScrollView>
          
          <View style={styles.footerContainer}>
            <Button
              title="Close"
              onPress={onClose}
              containerStyle={styles.footerButton}
            />
          </View>
        </View>
      </Animated.View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as ViewStyle,
  overlayTouch: {
    flex: 1,
  } as ViewStyle,
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.md,
  } as ViewStyle,
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: 20,
    maxHeight: '90%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  } as ViewStyle,
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  } as ViewStyle,
  headerSpacing: {
    height: theme.spacing.lg,
  } as ViewStyle,
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    minHeight: 60,
  } as ViewStyle,
  closeButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.md,
  } as ViewStyle,
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    flex: 1,
    flexWrap: 'wrap',
  } as TextStyle,
  section: {
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  } as TextStyle,
  pillWrapper: {
    paddingLeft: theme.spacing.lg + theme.spacing.xs,
  } as ViewStyle,
  pillContainer: {
    alignSelf: 'flex-start',
    maxWidth: '60%',
  } as ViewStyle,
  sectionContent: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  } as TextStyle,
  itemContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  itemTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  itemNotes: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  } as TextStyle,
  supportDetails: {
    marginTop: theme.spacing.xs,
    backgroundColor: 'transparent',
  } as ViewStyle,
  supportDetail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    backgroundColor: 'transparent',
  } as TextStyle,
  supportLabel: {
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.secondary,
  } as TextStyle,
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.lg + theme.spacing.xs,
  } as TextStyle,
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.primary,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  } as ViewStyle,
  footerButton: {
    flex: 1,
    maxWidth: 200,
  } as ViewStyle,
});

export default StrategyModal;