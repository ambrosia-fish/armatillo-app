import React from 'react';
import { 
  View, 
  StyleSheet, 
  Platform,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Text
} from 'react-native';
import theme from '@/app/constants/theme';

interface TriggerPillProps {
  id: string;
  emoji: string;
  label?: string;
  count?: number;
  onToggle: (id: string) => void;
  selected?: boolean;
}

/**
 * A specialized pill component that combines an emoji with label and "Create New Strategy" text
 * along with a badge counter showing the number of occurrences
 */
const TriggerPill: React.FC<TriggerPillProps> = ({ 
  id, 
  emoji, 
  label = "Home", 
  count = 0,
  onToggle,
  selected = false
}) => {
  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={[
          styles.container,
          selected && styles.containerSelected,
          Platform.OS === 'web' && styles.webContainer,
          Platform.OS === 'web' && selected && styles.webContainerSelected
        ]}
        onPress={() => onToggle(id)}
        accessibilityLabel={`${selected ? 'Selected' : 'Unselected'} ${label} - Create New Strategy`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <View style={styles.leftContent}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text 
            style={[
              styles.label, 
              selected && styles.labelSelected
            ]}
          >
            {label}
          </Text>
        </View>
        
        <View style={styles.separator} />
        
        <View style={styles.centerContent}>
          <Text style={styles.strategyText}>Create New Strategy</Text>
        </View>
        
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingTop: 12,  // Add padding for the badge overflow
    paddingRight: 12, // Add padding for the badge overflow
    width: '100%',
  } as ViewStyle,
  
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    width: '100%',
    position: 'relative',
  } as ViewStyle,
  
  containerSelected: {
    backgroundColor: theme.colors.primary.light + '30',
    borderColor: theme.colors.primary.main,
  } as ViewStyle,
  
  // Web-specific container styles
  webContainer: {
    display: 'flex',
    userSelect: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as ViewStyle,
  
  webContainerSelected: {
    boxShadow: `0 0 0 1px ${theme.colors.primary.main}`,
  } as ViewStyle,
  
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80, // Fixed width for consistent layout
  } as ViewStyle,
  
  emoji: {
    fontSize: 18,
    marginRight: 6,
  } as TextStyle,
  
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  } as TextStyle,
  
  labelSelected: {
    color: theme.colors.text.primary,
    fontWeight: 'bold',
  } as TextStyle,
  
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  separator: {
    width: 1,
    height: '60%',
    backgroundColor: theme.colors.border.light,
    marginHorizontal: 8,
  } as ViewStyle,
  
  strategyText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  } as TextStyle,
  
  badge: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: theme.colors.utility.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
    // Web-specific styles
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      zIndex: 1,
    } : {
      zIndex: 1,
    })
  } as ViewStyle,
  
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  } as TextStyle,
});

export default TriggerPill;