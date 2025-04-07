import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import theme from '@/app/constants/theme';

interface DurationPickerModalProps {
  visible: boolean;
  onCancel: () => void;
  onDone: () => void;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
}

export default function DurationPickerModal({
  visible,
  onCancel,
  onDone,
  selectedDuration,
  setSelectedDuration
}: DurationPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.pickerModalContainer}>
        <View style={styles.pickerModalContent}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.pickerCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>Duration (minutes)</Text>
            <TouchableOpacity onPress={onDone}>
              <Text style={styles.pickerDoneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
        <View style={styles.pickerContainer}>
          {/* Duration Picker */}
          <Picker
            style={styles.picker}
            selectedValue={selectedDuration}
            onValueChange={setSelectedDuration}
          >
            <Picker.Item 
              label="Did Not Engage" 
              value={0} 
              key="duration-0" 
            />
            {Array.from({ length: 120 }, (_, i) => i + 1).map((value) => (
              <Picker.Item 
                key={`duration-${value}`} 
                label={`${value} min`} 
                value={value} 
              />
            ))}
          </Picker>
        </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerModalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.md,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  pickerTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  pickerCancelButton: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  pickerDoneButton: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  picker: {
    flex: 1,
    height: 200,
  },
});