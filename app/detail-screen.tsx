import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { triggerOptions } from './constants/optionDictionaries';
import EmojiSelectionGrid from './components/EmojiSelectionGrid';

export default function DetailScreen() {
  const router = useRouter();
  
  // UI state
  const [urgeStrength, setUrgeStrength] = useState<number | null>(null);
  const [intentionType, setIntentionType] = useState<string | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  const handleNext = () => {
    // Save the data
    console.log('Saving trigger data:', { 
      urgeStrength,
      intentionType,
      selectedTriggers,
    });
    
    // Navigate to the next screen in the questionnaire flow
    router.push('/environment-screen');
  };

  const handleTriggerSelection = (triggerId: string) => {
    setSelectedTriggers(prevSelected => {
      // If already selected, remove it
      if (prevSelected.includes(triggerId)) {
        return prevSelected.filter(id => id !== triggerId);
      }
      // Otherwise add it
      return [...prevSelected, triggerId];
    });
  };

  // Helper function to render strength option buttons (1-10)
  const renderStrengthOptions = () => {
    const options = [];
    for (let i = 1; i <= 10; i++) {
      options.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.strengthOption,
            urgeStrength === i && styles.selectedOption,
          ]}
          onPress={() => setUrgeStrength(i)}
        >
          <Text
            style={[
              styles.strengthOptionText,
              urgeStrength === i && styles.selectedOptionText,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return options;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>About the Instance</Text>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Urge Strength Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How strong was the urge?</Text>
          <View style={styles.strengthOptionsContainer}>
            {renderStrengthOptions()}
          </View>
          <View style={styles.strengthLabelsContainer}>
            <Text style={styles.strengthLabel}>Mild</Text>
            <Text style={styles.strengthLabel}>Strong</Text>
          </View>
        </View>
        
        {/* Intention Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Was it intentional or automatic?</Text>
          <View style={styles.intentionOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.intentionOption,
                intentionType === 'intentional' && styles.selectedOption,
              ]}
              onPress={() => setIntentionType('intentional')}
            >
              <Text
                style={[
                  styles.intentionOptionText,
                  intentionType === 'intentional' && styles.selectedOptionText,
                ]}
              >
                Intentional
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.intentionOption,
                intentionType === 'automatic' && styles.selectedOption,
              ]}
              onPress={() => setIntentionType('automatic')}
            >
              <Text
                style={[
                  styles.intentionOptionText,
                  intentionType === 'automatic' && styles.selectedOptionText,
                ]}
              >
                Automatic
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Triggers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Do you know what triggered it?</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <EmojiSelectionGrid 
            options={triggerOptions}
            selectedItems={selectedTriggers}
            onSelect={handleTriggerSelection}
          />
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
  nextButton: {
    padding: 8,
  },
  nextButtonText: {
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
  strengthOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  strengthOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#2a9d8f',
    borderColor: '#2a9d8f',
  },
  strengthOptionText: {
    textAlign: 'center',
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  strengthLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  strengthLabel: {
    color: '#666',
    fontSize: 14,
  },
  intentionOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intentionOption: {
    flex: 1,
    marginHorizontal: 5,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intentionOptionText: {
    textAlign: 'center',
    fontSize: 16,
  }
});
