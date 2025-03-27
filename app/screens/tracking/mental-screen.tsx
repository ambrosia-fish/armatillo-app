import React, { useState } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useFormContext } from '@/app/context/FormContext';
import theme from '@/app/constants/theme';

// Emotion options
const emotionOptions = [
  { id: 'stressed', label: 'Stressed', emoji: '😥' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { id: 'angry', label: 'Angry', emoji: '😠' },
  { id: 'bored', label: 'Bored', emoji: '😒' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
  { id: 'content', label: 'Content', emoji: '😌' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'embarrassed', label: 'Embarrassed', emoji: '😳' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '🥴' },
  { id: 'distracted', label: 'Distracted', emoji: '🤔' },
  { id: 'focused', label: 'Focused', emoji: '🧐' },
];

export default function MentalScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default to empty arrays if not set
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    formData.selectedEmotions || []
  );
  
  // Additional details for mental state
  const [mentalDetails, setMentalDetails] = useState<string>(
    formData.mentalDetails || ''
  );
  
  // Toggle emotion selection
  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev => {
      if (prev.includes(emotionId)) {
        return prev.filter(id => id !== emotionId);
      } else {
        return [...prev, emotionId];
      }
    });
  };
  
  // Handle continue button
  const handleContinue = () => {
    // Update form data
    updateFormData({
      selectedEmotions,
      mentalDetails
    });
    
    // Navigate to next screen
    router.push('/screens/tracking/physical-screen');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary.main} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Mental State</Text>
        
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How were you feeling emotionally?</Text>
          <Text style={styles.cardDescription}>
            Select all emotions that apply to how you were feeling before or during the BFRB.
          </Text>
          
          {/* Emotions Options Grid */}
          <View style={styles.optionsGrid}>
            {emotionOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedEmotions.includes(option.id) && styles.optionButtonSelected
                ]}
                onPress={() => toggleEmotion(option.id)}
                activeOpacity={0.7}
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedEmotions.includes(option.id) }}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Any additional details about your emotional state..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={mentalDetails}
            onChangeText={setMentalDetails}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
      
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.7}
          accessibilityLabel="Continue"
          accessibilityRole="button"
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
        >
          <Ionicons name="close-circle-outline" size={18} color={theme.colors.secondary.main} />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  optionButton: {
    width: '33.33%',
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    borderRadius: 8,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 12,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    fontSize: 14,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
    minHeight: 80,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  continueButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  cancelButtonText: {
    marginLeft: 8,
    color: theme.colors.secondary.main,
    fontSize: 14,
  },
});
