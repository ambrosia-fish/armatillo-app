import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { thoughtOptions } from './constants/optionDictionaries';
import EmojiSelectionGrid from './components/EmojiSelectionGrid';
import CancelFooter from './components/CancelFooter';
import { useFormContext } from './context/FormContext';

export default function ThoughtsScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Initialize state from context if available
  const [thoughts, setThoughts] = useState(
    formData.thoughts || ''
  );
  const [selectedThoughts, setSelectedThoughts] = useState<string[]>(
    formData.selectedThoughts || []
  );
  
  const handleNext = () => {
    // Save data to context
    updateFormData({ 
      selectedThoughts,
      thoughts 
    });
    
    router.push('/notes-screen');
  };

  const handleThoughtSelection = (id: string) => {
    setSelectedThoughts(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      }
      return [...prevSelected, id];
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>What were you thinking?</Text>
        <TouchableOpacity onPress={handleNext} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common thought patterns</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <EmojiSelectionGrid
            options={thoughtOptions}
            selectedItems={selectedThoughts}
            onSelect={handleThoughtSelection}
          />
        </View>
      </ScrollView>
      
      {/* Add Cancel Footer */}
      <CancelFooter />
      
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#2a9d8f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
});
