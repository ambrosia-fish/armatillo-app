import React from 'react';
import {
  StyleSheet,
  View as RNView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/app/constants/theme';
import { Text, View, Card, EmojiPill } from '@/app/components';
import { OptionItem } from '@/app/constants/optionDictionaries';

// Default trigger when none is provided
const DEFAULT_TRIGGER: OptionItem = {
  id: 'unknown',
  label: 'Unknown',
  emoji: '❓'
};

export interface CompetingResponse {
  _id: string;
  title: string;
  action?: string;
  isActive: boolean;
}

export interface StimulusControl {
  _id: string;
  title: string;
  action?: string;
  isActive: boolean;
}

export interface CommunitySupport {
  _id: string;
  name: string;
  relationship?: string;
  contactInfo?: string;
  action?: string;
  isActive: boolean;
}

export interface Notification {
  _id: string;
  message: string;
  frequency: string;
  time: Date;
  isActive: boolean;
}

export interface Strategy {
  _id: string;
  name: string;
  description?: string;
  trigger: OptionItem;
  isActive: boolean;
  competingResponses: CompetingResponse[];
  stimulusControls: StimulusControl[];
  communitySupports: CommunitySupport[];
  notifications: Notification[];
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StrategyCardProps {
  strategy: Strategy;
  onPress?: () => void;
}

/**
 * InfoItem component for consistent display of strategy details
 */
const InfoItem = ({ 
  icon, 
  label, 
  value, 
  count
}: { 
  icon: string; 
  label: string; 
  value: string; 
  count?: string;
}) => (
  <RNView style={styles.infoItem}>
    <RNView style={styles.infoIconContainer}>
      <Ionicons name={icon} size={16} color={theme.colors.primary.main} />
    </RNView>
    <RNView style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <RNView style={styles.valueRow}>
        <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
        {count && (
          <RNView style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </RNView>
        )}
      </RNView>
    </RNView>
  </RNView>
);

/**
 * Enhanced StrategyCard Component
 * Displays a card with strategy information including name, trigger, and key details
 */
const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onPress }) => {
  const { 
    name, 
    trigger, 
    isActive, 
    competingResponses, 
    stimulusControls, 
    communitySupports 
  } = strategy;
  
  // Calculate active item counts
  const activeResponsesCount = competingResponses?.filter(response => response.isActive)?.length || 0;
  const activeControlsCount = stimulusControls?.filter(control => control.isActive)?.length || 0;
  const activeSupportsCount = communitySupports?.filter(support => support.isActive)?.length || 0;
  
  // Ensure trigger is valid
  const validTrigger = trigger && typeof trigger === 'object' && trigger.id ? 
    trigger : DEFAULT_TRIGGER;
    
  // Get the label to display from the trigger
  const triggerLabel = validTrigger?.label || 'Unknown';
  
  return (
    <Card
      containerStyle={[
        styles.container,
        !isActive && styles.inactiveCard
      ]}
      onPress={onPress}
      accessibilityLabel={`Strategy ${name}`}
      accessibilityHint="Tap to view strategy details"
    >
      {/* Header with Title and Status */}
      <RNView style={styles.cardHeader}>
        <RNView style={styles.titleContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>{name}</Text>
          {isActive ? (
            <RNView style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} />
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
            label={triggerLabel}
            emoji={validTrigger.emoji}
            selected={true}
            onToggle={() => {}}
          />
        </RNView>
      </RNView>
      
      {/* Divider */}
      <RNView style={styles.divider} />
      
      {/* Info Items */}
      <RNView style={styles.infoContainer}>
        {/* Competing Responses */}
        {competingResponses && competingResponses.length > 0 && (
          <InfoItem 
            icon="swap-horizontal-outline"
            label="Competing Response"
            value={competingResponses[0].title}
            count={competingResponses.length > 1 ? `${activeResponsesCount}/${competingResponses.length}` : undefined}
          />
        )}
        
        {/* Stimulus Controls */}
        {stimulusControls && stimulusControls.length > 0 && (
          <InfoItem 
            icon="shield-outline"
            label="Stimulus Control"
            value={stimulusControls[0].title}
            count={stimulusControls.length > 1 ? `${activeControlsCount}/${stimulusControls.length}` : undefined}
          />
        )}
        
        {/* Community Supports */}
        {communitySupports && communitySupports.length > 0 && (
          <InfoItem 
            icon="people-outline"
            label="Support"
            value={communitySupports[0].name}
            count={communitySupports.length > 1 ? `${activeSupportsCount}/${communitySupports.length}` : undefined}
          />
        )}
      </RNView>
      
      {/* View Details Button */}
      <TouchableOpacity 
        style={styles.viewDetailsButton} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.primary.main} />
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary.main,
  },
  inactiveCard: {
    borderLeftColor: theme.colors.text.tertiary,
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 181, 67, 0.1)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  inactiveBadge: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.success,
    marginLeft: 2,
  },
  inactiveText: {
    color: theme.colors.text.tertiary,
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  triggerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  triggerIcon: {
    marginRight: 4,
  },
  triggerText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  emojiPillContainer: {
    alignSelf: 'flex-start',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginBottom: theme.spacing.md,
  },
  infoContainer: {
    marginBottom: theme.spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  infoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(82, 130, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: theme.spacing.xs,
  },
  countText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary.main,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    backgroundColor: 'rgba(82, 130, 255, 0.05)',
    borderRadius: theme.borderRadius.sm,
  },
  viewDetailsText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary.main,
    marginRight: theme.spacing.xs,
  },
});

export default StrategyCard;