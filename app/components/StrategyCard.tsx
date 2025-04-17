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

// Default trigger to use when none is provided
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
  const activeResponsesCount = competingResponses?.filter(response => response.isActive)?.length || 0;
  
  // Ensure trigger is valid - use default if undefined/invalid
  const validTrigger = trigger && typeof trigger === 'object' && trigger.id ? 
    trigger : DEFAULT_TRIGGER;
  
  // Dummy function for EmojiPill since we don't need to toggle it in the card
  const handleEmojiPillToggle = () => {};
  
  return (
    <Card
      containerStyle={styles.container}
      onPress={onPress}
      accessibilityLabel={`Strategy ${name}`}
      accessibilityHint="Tap to view strategy details"
    >
      {/* Render the EmojiPill for trigger */}
      <RNView style={styles.emojiPillContainer}>
        <EmojiPill
          id={validTrigger.id}
          label={validTrigger.label}
          emoji={validTrigger.emoji}
          selected={true}
          onToggle={handleEmojiPillToggle}
        />
      </RNView>
      
      {/* Competing Responses */}
      {competingResponses && competingResponses.length > 0 && (
        <RNView style={styles.infoRow}>
          <Text style={styles.infoLabel}>Competing Response:</Text>
          <Text style={styles.infoValue}>
            {competingResponses[0].title}
            {competingResponses.length > 1 && ` (${activeResponsesCount}/${competingResponses.length})`}
          </Text>
        </RNView>
      )}
      
      {/* Stimulus Controls - Only show first one if available */}
      {stimulusControls && stimulusControls.length > 0 && (
        <RNView style={styles.infoRow}>
          <Text style={styles.infoLabel}>Stimulus Control:</Text>
          <Text style={styles.infoValue}>
            {stimulusControls[0].title}
          </Text>
        </RNView>
      )}
      
      {/* Community Supports - Only show first one if available */}
      {communitySupports && communitySupports.length > 0 && (
        <RNView style={styles.infoRow}>
          <Text style={styles.infoLabel}>Support:</Text>
          <Text style={styles.infoValue}>
            {communitySupports[0].name}
          </Text>
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
  
  emojiPillContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  
  infoLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
    minWidth: 150,
  } as TextStyle,
  
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    flex: 1,
  } as TextStyle,
});

export default StrategyCard;