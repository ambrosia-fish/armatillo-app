import React from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import theme from '@/app/styles/theme';
import { 
  Header, 
  Button, 
  AnswerSelectorModal
} from '@/app/components';
import OptionDictionaries from '@/app/constants/options';
import { navigateBack } from '@/app/utils/navigation.utils';

// Direct imports instead of from index.ts to break the cycle
import TimePickerModal from '@/app/features/tracking/components/TimePickerModal/TimePickerModal';
import DurationPickerModal from '@/app/features/tracking/components/DurationPickerModal/DurationPickerModal';
import AwarenessTypeSection from '@/app/features/tracking/components/FormSections/AwarenessTypeSection/AwarenessTypeSection';
import UrgeStrengthSection from '@/app/features/tracking/components/FormSections/UrgeStrengthSection/UrgeStrengthSection';
import TimeAndDurationSection from '@/app/features/tracking/components/FormSections/TimeAndDurationSection/TimeAndDurationSection';
import CategorySection from '@/app/features/tracking/components/FormSections/CategorySection/CategorySection';
import NotesSection from '@/app/features/tracking/components/FormSections/NotesSection/NotesSection';
import useEntryForm from '@/app/features/tracking/hooks/useEntryForm';

export default function NewEntryScreen() {
  const form = useEntryForm();

  /**
   * Handle cancellation and return to previous screen
   */
  const handleCancel = () => {
    // Use the standardized navigation utility
    navigateBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Header 
        title="New Instance" 
        showBackButton 
        onLeftPress={handleCancel}
      />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Awareness Type (Intentional/Automatic) */}
        <AwarenessTypeSection
          awarenessType={form.awarenessType}
          toggleAwarenessType={form.toggleAwarenessType}
        />

        {/* Urge Strength */}
        <UrgeStrengthSection
          urgeStrength={form.urgeStrength}
          setUrgeStrength={form.setUrgeStrength}
        />

        {/* Time and Duration */}
        <TimeAndDurationSection
          date={form.date}
          duration={form.duration}
          formatTime={form.formatTime}
          showTimePickerModal={form.showTimePickerModal}
          showDurationPickerModal={form.showDurationPickerModal}
        />

        {/* Location */}
        <CategorySection
          title="Location"
          categoryType="location"
          selectedItems={form.selectedLocations}
          options={OptionDictionaries.locationOptions}
          onToggleItem={form.toggleCategoryItem}
          onOpenModal={form.openModal}
        />

        {/* Activity */}
        <CategorySection
          title="Activity"
          categoryType="activity"
          selectedItems={form.selectedActivities}
          options={OptionDictionaries.activityOptions}
          onToggleItem={form.toggleCategoryItem}
          onOpenModal={form.openModal}
        />

        {/* Emotions */}
        <CategorySection
          title="Emotions"
          categoryType="emotion"
          selectedItems={form.selectedEmotions}
          options={OptionDictionaries.emotionOptions}
          onToggleItem={form.toggleCategoryItem}
          onOpenModal={form.openModal}
        />

        {/* Thought Patterns */}
        <CategorySection
          title="Thought Patterns"
          categoryType="thought"
          selectedItems={form.selectedThoughts}
          options={OptionDictionaries.thoughtOptions}
          onToggleItem={form.toggleCategoryItem}
          onOpenModal={form.openModal}
        />

        {/* Physical Sensations */}
        <CategorySection
          title="Physical Sensations"
          categoryType="sensation"
          selectedItems={form.selectedSensations}
          options={OptionDictionaries.sensationOptions}
          onToggleItem={form.toggleCategoryItem}
          onOpenModal={form.openModal}
        />

        {/* Notes */}
        <NotesSection
          notes={form.notes}
          setNotes={form.setNotes}
        />
      </ScrollView>

      {/* iOS-style Time Picker Modal */}
      {(Platform.OS === 'ios' || Platform.OS === 'web') && (
        <TimePickerModal
          visible={form.showTimePicker}
          onCancel={() => form.setShowTimePicker(false)}
          onDone={form.updateSelectedTime}
          selectedHours={form.selectedHours}
          selectedMinutes={form.selectedMinutes}
          setSelectedHours={form.setSelectedHours}
          setSelectedMinutes={form.setSelectedMinutes}
        />
      )}
      
      {/* iOS-style Duration Picker Modal */}
      {(Platform.OS === 'ios' || Platform.OS === 'web') && (
        <DurationPickerModal
          visible={form.showDurationPicker}
          onCancel={() => form.setShowDurationPicker(false)}
          onDone={form.updateSelectedDuration}
          selectedDuration={form.selectedDuration}
          setSelectedDuration={form.setSelectedDuration}
        />
      )}

      {/* Answer Selector Modal */}
      <AnswerSelectorModal
        visible={form.modalVisible}
        title={form.modalTitle}
        options={form.modalOptions}
        selectedIds={form.modalSelected}
        onSelect={form.handleModalSelect}
        onClose={() => form.setModalVisible(false)}
        allowMultiple={true}
        allowCustom={true}
      />
      
      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          title={form.isSubmitting ? "Submitting..." : "Submit"}
          variant="primary"
          onPress={form.handleSubmit}
          disabled={form.isSubmitting}
          style={styles.submitButton}
          accessibilityLabel={form.isSubmitting ? "Submitting form" : "Submit form"}
          accessibilityHint="Submits the form and saves the data"
        />
        
        <Button
          title="Cancel"
          variant="text"
          onPress={handleCancel}
          disabled={form.isSubmitting}
          style={styles.cancelButton}
          accessibilityLabel="Cancel form"
          accessibilityHint="Cancels the form and returns to previous screen"
        />
        
        {/* Loading indicator */}
        {form.isSubmitting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator 
              size="large" 
              color={theme.colors.primary.main} 
              style={styles.loadingIndicator}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.huge,
    alignItems: 'center',
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  submitButton: {
    marginBottom: theme.spacing.md,
  },
  cancelButton: {},
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    padding: theme.spacing.lg,
  }
});