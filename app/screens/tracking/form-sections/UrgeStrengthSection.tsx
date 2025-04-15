import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@/app/constants/theme';

interface UrgeStrengthSectionProps {
  urgeStrength: string;
  setUrgeStrength: (value: string) => void;
}

const UrgeStrengthSection: React.FC<UrgeStrengthSectionProps> = ({ 
  urgeStrength, 
  setUrgeStrength 
}) => {
  // Create array of values from 1-5
  const urgeValues = ['1', '2', '3', '4', '5'];
  
  // Get label for selected urge strength
  const getUrgeLabel = (value: string) => {
    switch(value) {
      case '1': return 'Very low urge';
      case '2': return 'Low urge';
      case '3': return 'Mild urge';
      case '4': return 'Moderate urge';
      case '5': return 'Strong urge';
      default: return '';
    }
  };

  // Get opacity based on value (1-5)
  const getButtonOpacity = (value: string): number => {
    const numValue = parseInt(value);
    return numValue * 0.2; // Scale from 0.2 to 1.0
  };
  
  return (
    <View style={styles.formSection}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>
          How strong was the urge?
        </Text>
      </View>
      {urgeStrength && (
        <Text style={styles.selectedLabel}>
          {getUrgeLabel(urgeStrength)}
        </Text>
      )}
      
      <View style={styles.scaleLabelsContainer}>
        <Text style={styles.scaleLabel}>Low</Text>
        <Text style={styles.scaleLabel}>High</Text>
      </View>
      
      <View style={styles.urgeStrengthContainer}>
        {urgeValues.map((value) => (
          <TouchableOpacity 
            key={value}
            style={[
              styles.urgeButton,
              { 
                backgroundColor: theme.colors.utility.error,
                opacity: getButtonOpacity(value)
              },
              urgeStrength === value && styles.selectedButton,
            ]}
            onPress={() => setUrgeStrength(value)}
            accessibilityLabel={`Urge strength ${value}`}
            accessibilityRole="button"
            accessibilityState={{ selected: urgeStrength === value }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    marginBottom: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    position: 'relative',
    width: '100%',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  scaleLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.xs,
  },
  scaleLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  urgeStrengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  urgeButton: {
    width: '18%',
    aspectRatio: 1.2,
    borderRadius: theme.borderRadius.md,
  },
  selectedButton: {
    borderWidth: 3,
    borderColor: theme.colors.neutral.dark,
    opacity: 1, // Make selected button full opacity
  },
  selectedLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export default UrgeStrengthSection;