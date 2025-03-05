import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface CancelFooterProps {
  onCancel?: () => void; // Optional callback for additional actions on cancel
}

export default function CancelFooter({ onCancel }: CancelFooterProps) {
  const router = useRouter();

  const handleCancel = () => {
    // If custom onCancel provided, execute it
    if (onCancel) {
      onCancel();
    }
    
    // Navigate to home - the tabs root
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={handleCancel}
      >
        <Ionicons name="close-circle-outline" size={20} color="#e63946" />
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e63946',
  },
  cancelButtonText: {
    color: '#e63946',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
});
