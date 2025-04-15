import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@/app/constants/theme';

interface TimeAndDurationSectionProps {
  date: Date;
  duration: string;
  formatTime: (date: Date) => string;
  showTimePickerModal: () => void;
  showDurationPickerModal: () => void;
}

const TimeAndDurationSection: React.FC<TimeAndDurationSectionProps> = ({
  date,
  duration,
  formatTime,
  showTimePickerModal,
  showDurationPickerModal
}) => {
  return (
    <View style={styles.formSection}>
      <View style={styles.timeAndDurationContainer}>
        {/* Time Picker */}
        <View style={styles.timeContainer}>
          <Text style={styles.inputLabel}>When did it occur?</Text>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={showTimePickerModal}
            accessibilityLabel="Select time"
            accessibilityHint="Opens time picker"
            accessibilityRole="button"
          >
            <Text style={styles.timeText}>
              {formatTime(date)}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Duration Input */}
        <View style={styles.durationContainer}>
          <Text style={styles.inputLabel}>How long did it last?</Text>
          <TouchableOpacity
            style={styles.durationPickerButton}
            onPress={showDurationPickerModal}
            accessibilityLabel="Select duration"
            accessibilityHint="Opens duration picker"
            accessibilityRole="button"
          >
            <Text style={styles.durationText}>
              {duration}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    marginBottom: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  timeAndDurationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: theme.spacing.md,
  },
  timeContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  durationContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    padding: theme.spacing.md,
    width: '100%',
  },
  timeText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginRight: theme.spacing.sm,
  },
  durationPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    padding: theme.spacing.md,
    width: '100%',
  },
  durationText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
});

export default TimeAndDurationSection;