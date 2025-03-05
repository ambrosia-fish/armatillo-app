import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sensoryOptions } from './constants/optionDictionaries';
import EmojiSelectionGrid from './components/EmojiSelectionGrid';

export default function NotesScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [selectedSensoryTriggers, setSelectedSensoryTriggers] = useState<string[]>([]);
  
  const handleSave = () => {
    console.log('Saving final data:', { 
      selectedSensoryTriggers,
      notes
    });
    
    // Show confirmation and return to home
    Alert.alert(
      "Instance Saved",
      "Your BFRB instance has been recorded successfully.",
      [
        { 
          text: "OK", 
          onPress: () => router.replace('/(tabs)') 
        }
      ]
    );
  };

  const handleSensorySelection = (id: string) => {
    setSelectedSensoryTriggers(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      }
      return [...prevSelected, id];
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Additional Notes</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Were there any sensory triggers?</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <EmojiSelectionGrid
            options={sensoryOptions}
            selectedItems={selectedSensoryTriggers}
            onSelect={handleSensorySelection}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Any additional notes?</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={6}
            placeholder="Add any additional notes, observations, or context..."
            value={notes}
            onChangeText={setNotes}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.infoText}>
            This is the last step. Press "Save" to record this BFRB instance.
          </Text>
          <TouchableOpacity style={styles.saveFullButton} onPress={handleSave}>
            <Text style={styles.saveFullButtonText}>Save Instance</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
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
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  saveFullButton: {
    backgroundColor: '#2a9d8f',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveFullButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
