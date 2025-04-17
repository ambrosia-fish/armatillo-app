import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/app/constants/theme';
import { Text, View, Card } from '@/app/components';

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
  trigger: string;
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
  onEdit?: () => void;
}

/**
 * StrategyCard Component
 * Displays a card with strategy information including name, trigger, and status
 * 
 * @param strategy - Strategy data to display
 * @param onPress - Function to call when the card is pressed to view details
 * @param onEdit - Function to call when the edit button is pressed
 */
const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onPress, onEdit }) => {
  const { name, trigger, isActive, competingResponses } = strategy;
  
  // Calculate active responses count
  const activeResponsesCount = competingResponses.filter(response => response.isActive).length;
  
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
      
      <RNView style={styles.triggerContainer}>
        <Ionicons name="flash-outline" size={16} color={theme.colors.text.secondary} />
        <Text style={styles.triggerText}>Trigger: {trigger}</Text>
      </RNView>
      
      <RNView style={styles.infoRow}>
        <RNView style={styles.infoItem}>
          <Ionicons name="swap-horizontal-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.infoText}>
            {competingResponses.length > 0 
              ? `${activeResponsesCount}/${competingResponses.length} responses` 
              : 'No responses'}
          </Text>
        </RNView>
        
        <RNView style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.viewButton} 
            onPress={onPress}
            accessibilityLabel="View details"
            accessibilityRole="button"
          >
            <Text style={styles.viewButtonText}>View</Text>
            <Ionicons name="eye-outline" size={16} color={theme.colors.primary.main} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={onEdit}
            accessibilityLabel="Edit strategy"
            accessibilityRole="button"
          >
            <Text style={styles.editButtonText}>Edit</Text>
            <Ionicons name="pencil-outline" size={16} color={theme.colors.primary.dark} />
          </TouchableOpacity>
        </RNView>
      </RNView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
  } as ViewStyle,
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
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
  
  triggerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  triggerText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  } as TextStyle,
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  } as ViewStyle,
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.xs,
  } as TextStyle,
  
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  } as ViewStyle,
  
  viewButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium as '500',
    marginRight: theme.spacing.xs,
  } as TextStyle,
  
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  editButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.dark,
    fontWeight: theme.typography.fontWeight.medium as '500',
    marginRight: theme.spacing.xs,
  } as TextStyle,
});

export default StrategyCard;