import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle,
  TextStyle
} from 'react-native';
import { Picker } from 'react-native-wheel-pick';
import theme from '@/app/styles/theme';
import ModalComponent from './modal';
import { Button } from '@/app/components';

interface DurationPickerModalProps {
  visible: boolean;
  onCancel: () => void;
  onDone: () => void;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
}

/**
 * Duration picker modal using react-native-wheel-pick for minutes selection
 */
export default function DurationPickerModal({
  visible,
  onCancel,
  onDone,
  selectedDuration,
  setSelectedDuration
}: DurationPickerModalProps) {
  // Generate minutes data (0-60) with custom labels
  const minutesData = [
    'Did Not Engage',
    ...Array.from({ length: 59 }, (_, i) => `${i + 1} min`),
    '1 hr+'
  ];
  
  // Handle picker value change
  const handleValueChange = (value: string) => {
    if (value === 'Did Not Engage') {
      setSelectedDuration(0);
    } else if (value === '1 hr+') {
      setSelectedDuration(60);
    } else {
      const minutes = parseInt(value, 10);
      setSelectedDuration(isNaN(minutes) ? 0 : minutes);
    }
  };
  
  // Get the picker value based on selectedDuration
  const getPickerValue = () => {
    if (selectedDuration === 0) return 'Did Not Engage';
    if (selectedDuration >= 60) return '1 hr+';
    return `${selectedDuration} min`;
  };
  
  // Modal footer with action buttons
  const modalFooter = (
    <View style={styles.footerContainer}>
      <Button
        title="Cancel"
        variant="secondary"
        onPress={onCancel}
        style={styles.footerButton}
      />
      <Button
        title="Done"
        variant="primary"
        onPress={onDone}
        style={styles.footerButton}
      />
    </View>
  );

  return (
    <ModalComponent
      visible={visible}
      title="Select Duration"
      onClose={onCancel}
      footer={modalFooter}
      contentStyle={styles.modalContent}
    >
      <View style={styles.contentContainer}>
        {/* Minutes Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            style={styles.picker}
            selectedValue={getPickerValue()}
            pickerData={minutesData}
            onValueChange={handleValueChange}
            textColor={theme.colors.text.primary}
          />
        </View>
      </View>
    </ModalComponent>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  } as ViewStyle,
  
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  } as ViewStyle,
  
  pickerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  picker: {
    backgroundColor: 'white',
    width: 220,
    height: 180,
  } as ViewStyle,
  
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  } as ViewStyle,
  
  pickerLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  } as ViewStyle,
  
  footerButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  } as ViewStyle,
});