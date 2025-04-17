// EmojiPill.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Platform, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import theme from '@/app/constants/theme';

interface EmojiPillProps {
  id: string;
  label: string;
  emoji: string;
  selected?: boolean;
  onToggle: (id: string) => void;
  // Added new props to control spacing
  noLeftMargin?: boolean;
  noLeftPadding?: boolean;
}

/**
 * A selectable pill component that displays an emoji and label
 * With specialized handling for web rendering
 */
const EmojiPill: React.FC<EmojiPillProps> = ({ 
  id, 
  label, 
  emoji, 
  selected = false, 
  onToggle,
  noLeftMargin = false,
  noLeftPadding = false
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.containerSelected,
        noLeftMargin && styles.noLeftMargin,
        noLeftPadding && styles.noLeftPadding,
        Platform.OS === 'web' && styles.webContainer,
        Platform.OS === 'web' && selected && styles.webContainerSelected
      ]}
      onPress={() => onToggle(id)}
      accessibilityLabel={`${selected ? 'Selected' : 'Unselected'} ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[
        styles.emoji,
        Platform.OS === 'web' && styles.webEmoji
      ]}>
        {emoji}
      </Text>
      <Text style={[
        styles.label,
        selected && styles.labelSelected,
        Platform.OS === 'web' && styles.webLabel,
        Platform.OS === 'web' && selected && styles.webLabelSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Styles with specialized handling for web
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
    margin: 4,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  } as ViewStyle,
  
  containerSelected: {
    backgroundColor: theme.colors.primary.light + '30',
    borderColor: theme.colors.primary.main,
  } as ViewStyle,
  
  // Added new styles for controlling margins and padding
  noLeftMargin: {
    marginLeft: 0,
  } as ViewStyle,
  
  noLeftPadding: {
    paddingLeft: 6, // Reduced from 12
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
  
  emoji: {
    fontSize: 18,
    marginRight: 6,
  } as TextStyle,
  
  // Web-specific emoji styles
  webEmoji: {
    display: 'inline-block',
    verticalAlign: 'middle',
  } as TextStyle,
  
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  } as TextStyle,
  
  labelSelected: {
    color: theme.colors.text.primary,
    fontWeight: 'bold',
  } as TextStyle,
  
  // Web-specific label styles
  webLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as TextStyle,
  
  webLabelSelected: {
    fontWeight: '600',
  } as TextStyle,
});

export default EmojiPill;