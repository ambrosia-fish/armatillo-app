import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import theme from '@/app/styles/theme';

interface NotesSectionProps {
  notes: string;
  setNotes: (value: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ 
  notes, 
  setNotes 
}) => {
  return (
    <View style={styles.formSection}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Notes</Text>
      </View>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional notes about this instance..."
        placeholderTextColor={theme.colors.text.tertiary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        accessibilityLabel="Notes field"
        accessibilityHint="Add any additional notes about this instance"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    marginBottom: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    position: 'relative',
    width: '100%',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    width: '100%',
    marginTop: theme.spacing.sm,
  },
});

export default NotesSection;