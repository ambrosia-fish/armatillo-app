import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  TextInput,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, Button } from '@/app/components';
import EmojiPill from '@/app/components/EmojiPill';
import theme from '@/app/constants/theme';
import strategiesApi from '@/app/services/strategies-api';
import { navigateBack } from '@/app/utils/navigationUtils';

const NewStrategyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Parse trigger from route params if available
  const [selectedTrigger, setSelectedTrigger] = useState(() => {
    if (route.params?.trigger) {
      try {
        const parsedTrigger = JSON.parse(route.params.trigger);
        console.log('Parsed trigger:', parsedTrigger);
        return parsedTrigger;
      } catch (e) {
        console.error('Error parsing trigger parameter:', e);
        return null;
      }
    }
    return null;
  });
  
  // Single Competing Response
  const [competingResponse, setCompetingResponse] = useState({
    title: '', 
    action: '', 
    isActive: true
  });
  
  // Single Stimulus Control
  const [stimulusControl, setStimulusControl] = useState({
    title: '', 
    action: '', 
    isActive: true
  });
  
  // Single Community Support
  const [communitySupport, setCommunitySupport] = useState({
    name: '', 
    action: '',
    isActive: true
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    navigateBack();
  };

  // Dummy handler for EmojiPill (won't change selection as trigger is pre-selected)
  const handleTriggerToggle = (id) => {
    // No-op - trigger is already selected and not changeable on this screen
  };

  const handleSave = async () => {
    // Validate fields
    if (!selectedTrigger || !selectedTrigger.id) {
      Alert.alert('Error', 'Please select a trigger');
      return;
    }
  
    if (!competingResponse.title || !competingResponse.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your competing response');
      return;
    }
  
    if (!stimulusControl.title || !stimulusControl.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your stimulus control');
      return;
    }
  
    if (!communitySupport.name || !communitySupport.name.trim()) {
      Alert.alert('Error', 'Please enter a name for your support person');
      return;
    }
  
    try {
      setIsLoading(true);
  
      // Use the field names expected by the API
      const strategyData = {
        // Let the backend use the trigger as the name
        trigger: selectedTrigger.id,
        competingResponses: [{
          title: competingResponse.title.trim(), 
          action: competingResponse.action ? competingResponse.action.trim() : ""
        }],
        stimulusControls: [{
          title: stimulusControl.title.trim(),
          action: stimulusControl.action ? stimulusControl.action.trim() : ""
        }],
        communitySupports: [{
          name: communitySupport.name.trim(),
          action: communitySupport.action ? communitySupport.action.trim() : ""
        }]
      };
  
      console.log('Sending data to API:', JSON.stringify(strategyData, null, 2));
      
      // Call API to create strategy
      const response = await strategiesApi.createStrategy(strategyData);
      console.log('API response:', response);
      
      // Navigate back to strategies list
      navigation.goBack();
    } catch (error) {
      console.error('Error creating strategy:', error);
      
      // Show more detailed error message if available
      const errorMessage = error.message || 'Failed to create strategy. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompetingResponse = (field, value) => {
    setCompetingResponse(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateStimulusControl = (field, value) => {
    setStimulusControl(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateCommunitySupport = (field, value) => {
    setCommunitySupport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderCompetingResponse = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name="swap-horizontal-outline"
            size={24}
            color={theme.colors.primary?.main || '#6200ee'}
          />
          <Text style={styles.sectionTitle}>Competing Response</Text>
        </View>
        
        <View style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemHeaderText}>Response</Text>
          </View>
          
          <TextInput
            placeholder="What's the name of your response?"
            value={competingResponse.title}
            onChangeText={(text) => updateCompetingResponse('title', text)}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Describe the action in detail (optional)"
            value={competingResponse.action}
            onChangeText={(text) => updateCompetingResponse('action', text)}
            style={styles.textArea}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    );
  };

  const renderStimulusControl = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name="shield-outline"
            size={24}
            color={theme.colors.primary?.main || '#6200ee'}
          />
          <Text style={styles.sectionTitle}>Stimulus Control</Text>
        </View>
        
        <View style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemHeaderText}>Control</Text>
          </View>
          
          <TextInput
            placeholder="What's the name of your control?"
            value={stimulusControl.title}
            onChangeText={(text) => updateStimulusControl('title', text)}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Describe how to implement this control (optional)"
            value={stimulusControl.action}
            onChangeText={(text) => updateStimulusControl('action', text)}
            style={styles.textArea}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    );
  };

  const renderCommunitySupport = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name="people-outline"
            size={24}
            color={theme.colors.primary?.main || '#6200ee'}
          />
          <Text style={styles.sectionTitle}>Community Support</Text>
        </View>
        
        <View style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemHeaderText}>Support Person</Text>
          </View>
          
          <TextInput
            placeholder="Person's name"
            value={communitySupport.name}
            onChangeText={(text) => updateCommunitySupport('name', text)}
            style={styles.input}
          />
          
          <TextInput
            placeholder="How can they support you?"
            value={communitySupport.action}
            onChangeText={(text) => updateCommunitySupport('action', text)}
            style={styles.textArea}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text?.primary || '#000000'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Strategy</Text>
        <View style={styles.headerRight} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="alert-circle-outline"
                size={24}
                color={theme.colors.primary?.main || '#6200ee'}
              />
              <Text style={styles.sectionTitle}>Trigger</Text>
            </View>
            <View style={styles.pillContainer}>
              {selectedTrigger ? (
                <EmojiPill
                  id={selectedTrigger.id}
                  emoji={selectedTrigger.emoji}
                  label={selectedTrigger.label}
                  selected={true}
                  onToggle={handleTriggerToggle}
                />
              ) : (
                <Text style={styles.placeholderText}>
                  No trigger selected. Please go back and select a trigger.
                </Text>
              )}
            </View>
          </View>
          
          {renderCompetingResponse()}
          {renderStimulusControl()}
          {renderCommunitySupport()}
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          title={isLoading ? "Saving..." : "Save Strategy"}
          variant="primary"
          onPress={handleSave}
          disabled={isLoading}
          style={styles.saveButton}
          accessibilityLabel="Save Strategy"
          accessibilityHint="Saves the strategy and returns to previous screen"
        />
        
        <Button
          title="Cancel"
          variant="text"
          onPress={handleCancel}
          disabled={isLoading}
          style={styles.cancelButton}
          accessibilityLabel="Cancel form"
          accessibilityHint="Cancels the form and returns to previous screen"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background?.primary || '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing?.lg || 16,
    paddingVertical: theme.spacing?.md || 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border?.light || '#E0E0E0',
    backgroundColor: theme.colors.background?.primary || '#FFFFFF',
  },
  backButton: {
    padding: theme.spacing?.xs || 4,
  },
  headerTitle: {
    fontSize: theme.typography?.fontSize?.xl || 24,
    fontWeight: theme.typography?.fontWeight?.bold || '700',
    color: theme.colors.text?.primary || '#000000',
    textAlign: 'center',
  },
  headerRight: {
    width: 28, // Same width as back button icon for balanced centering
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing?.lg || 16,
    paddingBottom: theme.spacing?.huge || 64,
  },
  formGroup: {
    marginBottom: theme.spacing?.xl || 24,
  },
  label: {
    fontSize: theme.typography?.fontSize?.md || 16,
    fontWeight: theme.typography?.fontWeight?.semiBold || '600',
    color: theme.colors.text?.primary || '#000000',
    marginBottom: theme.spacing?.sm || 8,
  },
  input: {
    backgroundColor: theme.colors.background?.secondary || '#F5F5F5',
    borderRadius: theme.borderRadius?.md || 8,
    paddingHorizontal: theme.spacing?.lg || 16,
    paddingVertical: theme.spacing?.md || 12,
    fontSize: theme.typography?.fontSize?.md || 16,
    color: theme.colors.text?.primary || '#000000',
    borderWidth: 1,
    borderColor: theme.colors.border?.light || '#E0E0E0',
    marginBottom: theme.spacing?.md || 12,
  },
  textArea: {
    backgroundColor: theme.colors.background?.secondary || '#F5F5F5',
    borderRadius: theme.borderRadius?.md || 8,
    paddingHorizontal: theme.spacing?.lg || 16,
    paddingVertical: theme.spacing?.md || 12,
    fontSize: theme.typography?.fontSize?.md || 16,
    color: theme.colors.text?.primary || '#000000',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border?.light || '#E0E0E0',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4, // Offset pill margin
    paddingLeft: theme.spacing.lg + theme.spacing.xs,
  },
  placeholderText: {
    fontSize: theme.typography?.fontSize?.md || 16,
    color: theme.colors.text?.tertiary || '#9E9E9E',
    padding: theme.spacing?.md || 12,
  },
  section: {
    marginBottom: theme.spacing?.xl || 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing?.md || 12,
    paddingHorizontal: theme.spacing?.sm || 8,
  },
  sectionTitle: {
    fontSize: theme.typography?.fontSize?.lg || 18,
    fontWeight: theme.typography?.fontWeight?.semiBold || '600',
    color: theme.colors.text?.primary || '#000000',
    marginLeft: theme.spacing?.sm || 8,
  },
  itemContainer: {
    backgroundColor: theme.colors.background?.primary || '#FFFFFF',
    borderRadius: theme.borderRadius?.md || 8,
    padding: theme.spacing?.lg || 16,
    marginBottom: theme.spacing?.md || 12,
    borderWidth: 1,
    borderColor: theme.colors.border?.light || '#E0E0E0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing?.md || 12,
  },
  itemHeaderText: {
    fontSize: theme.typography?.fontSize?.md || 16,
    fontWeight: theme.typography?.fontWeight?.semiBold || '600',
    color: theme.colors.text?.primary || '#000000',
  },
  footer: {
    padding: theme.spacing?.lg || 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border?.light || '#E0E0E0',
    backgroundColor: theme.colors.background?.primary || '#FFFFFF',
  },
  saveButton: {
    marginBottom: theme.spacing?.md || 12,
  },
  cancelButton: {},
});

export default NewStrategyScreen;