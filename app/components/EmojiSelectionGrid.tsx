import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OptionItem } from '../constants/optionDictionaries';

interface EmojiSelectionGridProps {
  options: OptionItem[];
  selectedItems: string[];
  onSelect: (id: string) => void;
  multiSelect?: boolean;
}

export default function EmojiSelectionGrid({
  options,
  selectedItems,
  onSelect,
  multiSelect = true,
}: EmojiSelectionGridProps) {

  const handleSelection = (id: string) => {
    onSelect(id);
  };

  return (
    <View style={styles.grid}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.gridItem,
            selectedItems.includes(option.id) && styles.selectedItem,
          ]}
          onPress={() => handleSelection(option.id)}
        >
          <Text style={styles.emoji}>{option.emoji}</Text>
          <Text
            style={[
              styles.label,
              selectedItems.includes(option.id) && styles.selectedLabel,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '31%',
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    borderColor: '#2a9d8f',
    borderWidth: 1,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  selectedLabel: {
    color: '#2a9d8f',
  },
});
