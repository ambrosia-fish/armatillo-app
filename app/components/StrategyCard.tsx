import React from 'react';
import {
  StyleSheet,
  ViewStyle,
  TextStyle,
  View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/app/constants/theme';
import { Text, View, Card, EmojiPill } from '@/app/components';
import { OptionItem } from '@/app/constants/optionDictionaries';

export interface CompetingResponse {
  _id: string;
  description: string;
  notes?: string;
  isActive: boolean;
}

export interface StimulusControl {
  _id: string;
  description: string;
  notes?: string;
  isActive: boolean;
}

export interface CommunitySupport {
  _id: string;
  name: string;
  relationship?: string;
  contactInfo?: string;
  notes?: string;
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
  trigger: OptionItem; // Changed from string to OptionItem
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
 * StrategyCard Component
 * Displays a card with strategy information including name, trigger (as EmojiPill), and status
 * 
 * @param strategy - Strategy data to display
 * @param onPress - Function to call when the card is pressed to view details
 */
const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onPress }) => {
  const { name, trigger, isActive, competingResponses, stimulusControls, communitySupports } = strategy;
  
  // Calculate active responses count
  const activeResponsesCount = competingResponses.filter(response => response.isActive).length;
  
  // Dummy function for EmojiPill since we don't need to toggle it in the card
  const handleEmojiPillToggle = () => {};
  
  return (
    <Card
      containerStyle={styles.container}
      onPress={onPress}
      accessibilityLabel={`Strategy ${name}`}
      accessibilityHint="Tap to view strategy details"
    >
      <RNView style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <RNView style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, isActive ? styles.activeText : styles.inactiveText]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </RNView>
      </RNView>
      
      {/* Render the EmojiPill for trigger */}
      <RNView style={styles.emojiPillContainer}>
        <EmojiPill
          id={trigger.id}
          label={trigger.label}
          emoji={trigger.emoji}
          selected={true}
          onToggle={handleEmojiPillToggle}
        />
      </RNView>
      
      {/* Competing Responses */}
      <RNView style={styles.infoRow}>
        <RNView style={styles.infoItem}>
          <Text style={styles.infoLabel}>Competing Response:</Text>
          <Text style={styles.infoValue}>
            {competingResponses.length > 0 
              ? `(${activeResponsesCount}/${competingResponses.length})` 
              : '(0)'}
          </Text>
        </RNView>
      </RNView>
      
      {/* Stimulus Controls - Only show first one if available */}
      {stimulusControls.length > 0 && (
        <RNView style={styles.infoRow}>
          <RNView style={styles.infoItem}>
            <Text style={styles.infoLabel}>Stimulus Control:</Text>
            <Text style={styles.infoValue}>
              {stimulusControls[0].description}
            </Text>
          </RNView>
        </RNView>
      )}
      
      {/* Community Supports - Only show first one if available */}
      {communitySupports.length > 0 && (
        <RNView style={styles.infoRow}>
          <RNView style={styles.infoItem}>
            <Text style={styles.infoLabel}>Support:</Text>
            <Text style={styles.infoValue}>
              {communitySupports[0].name}
            </Text>
          </RNView>
        </RNView>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
  } as ViewStyle,
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    flex: 1,
  } as TextStyle,
  
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  } as ViewStyle,
  
  activeBadge: {
    backgroundColor: 'rgba(107, 168, 119, 0.2)',
  } as ViewStyle,
  
  inactiveBadge: {
    backgroundColor: 'rgba(125, 132, 161, 0.2)',
  } as ViewStyle,
  
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,
  
  activeText: {
    color: theme.colors.utility.success,
  } as TextStyle,
  
  inactiveText: {
    color: theme.colors.text.tertiary,
  } as TextStyle,
  
  emojiPillContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  infoLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  } as TextStyle,
  
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  } as TextStyle,
});

export default StrategyCard;