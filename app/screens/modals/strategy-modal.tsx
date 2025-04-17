import React from 'react';
import {
  StyleSheet,
  ViewStyle,
  TextStyle,
  ScrollView,
  Platform,
  View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './modal';
import { View, Text, Button, EmojiPill } from '@/app/components';
import theme from '@/app/constants/theme';
import { Strategy, CompetingResponse, StimulusControl, CommunitySupport } from '@/app/components/StrategyCard';

interface StrategyModalProps {
  visible: boolean;
  strategy?: Strategy;
  onClose: () => void;
}

/**
 * StrategyModal Component
 * Modal for viewing strategies
 */
const StrategyModal: React.FC<StrategyModalProps> = ({
  visible,
  strategy,
  onClose,
}) => {
  if (!strategy) return null;

  return (
    <Modal
      visible={visible}
      title={strategy.name}
      onClose={onClose}
      contentStyle={styles.modalContent}
      footer={
        <View style={styles.footerContainer}>
          <Button
            title="Close"
            onPress={onClose}
            containerStyle={styles.footerButton}
          />
        </View>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            strategy.isActive ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              strategy.isActive ? styles.activeText : styles.inactiveText
            ]}>
              {strategy.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Trigger */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="flash-outline"
              size={20}
              color={theme.colors.primary.main}
            />
            <Text style={styles.sectionTitle}>Trigger</Text>
          </View>
          <View style={styles.triggerContainer}>
            <EmojiPill
              id={strategy.trigger.id}
              label={strategy.trigger.label}
              emoji={strategy.trigger.emoji}
              selected={true}
              onToggle={() => {}}
            />
          </View>
        </View>

        {/* Description (if available) */}
        {strategy.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={theme.colors.primary.main}
              />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.sectionContent}>{strategy.description}</Text>
          </View>
        )}

        {/* Competing Responses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="swap-horizontal-outline"
              size={20}
              color={theme.colors.primary.main}
            />
            <Text style={styles.sectionTitle}>Competing Responses</Text>
          </View>
          
          {strategy.competingResponses.length > 0 ? (
            strategy.competingResponses.map((response: CompetingResponse) => (
              <View key={response._id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{response.description}</Text>
                  <View style={[
                    styles.itemStatusBadge,
                    response.isActive ? styles.activeBadge : styles.inactiveBadge
                  ]}>
                    <Text style={[
                      styles.itemStatusText,
                      response.isActive ? styles.activeText : styles.inactiveText
                    ]}>
                      {response.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                {response.notes && (
                  <Text style={styles.itemNotes}>{response.notes}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No competing responses added</Text>
          )}
        </View>

        {/* Stimulus Controls */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="shield-outline"
              size={20}
              color={theme.colors.primary.main}
            />
            <Text style={styles.sectionTitle}>Stimulus Controls</Text>
          </View>
          
          {strategy.stimulusControls.length > 0 ? (
            strategy.stimulusControls.map((control: StimulusControl) => (
              <View key={control._id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{control.description}</Text>
                  <View style={[
                    styles.itemStatusBadge,
                    control.isActive ? styles.activeBadge : styles.inactiveBadge
                  ]}>
                    <Text style={[
                      styles.itemStatusText,
                      control.isActive ? styles.activeText : styles.inactiveText
                    ]}>
                      {control.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                {control.notes && (
                  <Text style={styles.itemNotes}>{control.notes}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No stimulus controls added</Text>
          )}
        </View>

        {/* Community Supports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="people-outline"
              size={20}
              color={theme.colors.primary.main}
            />
            <Text style={styles.sectionTitle}>Community Supports</Text>
          </View>
          
          {strategy.communitySupports.length > 0 ? (
            strategy.communitySupports.map((support: CommunitySupport) => (
              <View key={support._id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{support.name}</Text>
                  <View style={[
                    styles.itemStatusBadge,
                    support.isActive ? styles.activeBadge : styles.inactiveBadge
                  ]}>
                    <Text style={[
                      styles.itemStatusText,
                      support.isActive ? styles.activeText : styles.inactiveText
                    ]}>
                      {support.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
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
                  {support.notes && (
                    <Text style={styles.itemNotes}>{support.notes}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No community supports added</Text>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: theme.spacing.md,
  } as ViewStyle,

  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  } as ViewStyle,

  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  } as ViewStyle,

  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  } as ViewStyle,

  activeBadge: {
    backgroundColor: 'rgba(107, 168, 119, 0.2)',
  } as ViewStyle,

  inactiveBadge: {
    backgroundColor: 'rgba(125, 132, 161, 0.2)',
  } as ViewStyle,

  statusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,

  activeText: {
    color: theme.colors.utility.success,
  } as TextStyle,

  inactiveText: {
    color: theme.colors.text.tertiary,
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
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  } as TextStyle,

  sectionContent: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.lg + theme.spacing.xs,
  } as TextStyle,

  triggerContainer: {
    marginLeft: theme.spacing.lg,
  } as ViewStyle,

  itemContainer: {
    backgroundColor: theme.colors.neutral.lightest,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.lg,
  } as ViewStyle,

  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,

  itemTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    flex: 1,
  } as TextStyle,

  itemStatusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  } as ViewStyle,

  itemStatusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,

  itemNotes: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  } as TextStyle,

  supportDetails: {
    marginTop: theme.spacing.xs,
  } as ViewStyle,

  supportDetail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
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
  } as ViewStyle,

  footerButton: {
    flex: 1,
    maxWidth: 200,
  } as ViewStyle,
});

export default StrategyModal;