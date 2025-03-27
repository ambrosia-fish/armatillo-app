# Armatillo Tracking Screens

This document describes the standardized BFRB tracking flow and the common UI/UX patterns used throughout the tracking screens.

## Tracking Flow Overview

The tracking flow consists of 8 sequential screens:

1. **Time & Duration** (`time-screen.tsx`) - Collect when the BFRB happened and how long it lasted
2. **Urge & Intention** (`urge-screen.tsx`) - Collect urge strength and whether it was automatic or intentional
3. **Environment** (`environment-screen.tsx`) - Collect where the BFRB happened
4. **Mental State** (`mental-screen.tsx`) - Collect emotional state information
5. **Thought Patterns** (`thoughts-screen.tsx`) - Collect thought pattern information
6. **Physical Sensations** (`physical-screen.tsx`) - Collect physical sensations experienced
7. **Sensory Triggers** (`sensory-screen.tsx`) - Collect sensory trigger information
8. **Final Details & Submit** (`submit-screen.tsx`) - Collect additional notes and submit all data

## Common UI Components

All tracking screens share the following consistent UI components:

### Navigation Header

```jsx
<View style={styles.header}>
  <TouchableOpacity 
    onPress={() => router.back()} 
    style={styles.backButton}
    accessibilityLabel="Go back"
    accessibilityRole="button"
  >
    <Ionicons name="chevron-back" size={24} color={theme.colors.primary.main} />
  </TouchableOpacity>
  
  <Text style={styles.headerTitle}>Screen Title</Text>
  
  <View style={styles.headerRight} />
</View>
```

### Card Container

```jsx
<View style={styles.card}>
  <Text style={styles.cardTitle}>Card Title</Text>
  <Text style={styles.cardDescription}>
    Description text explaining what to do in this section.
  </Text>
  
  {/* Card content */}
</View>
```

### Selection Grid

```jsx
<View style={styles.optionsGrid}>
  {options.map((option) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionButton,
        selectedItems.includes(option.id) && styles.optionButtonSelected
      ]}
      onPress={() => toggleSelection(option.id)}
      activeOpacity={0.7}
      accessibilityLabel={option.label}
      accessibilityRole="button"
      accessibilityState={{ selected: selectedItems.includes(option.id) }}
    >
      <Text style={styles.optionEmoji}>{option.emoji}</Text>
      <Text style={[
        styles.optionLabel,
        selectedItems.includes(option.id) && styles.optionLabelSelected
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  ))}
</View>
```

### Text Input

```jsx
<TextInput
  style={styles.input}
  placeholder="Placeholder text..."
  placeholderTextColor={theme.colors.text.tertiary}
  value={inputValue}
  onChangeText={setInputValue}
  multiline
  numberOfLines={3}
  textAlignVertical="top"
/>
```

### Footer with Continue/Cancel Buttons

```jsx
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
```

## Data Handling Pattern

Each screen follows a consistent data handling pattern:

1. **State Management** - Each screen maintains its state using React hooks
2. **Form Context** - All screens access and update the shared form data using the FormContext
3. **Secure Storage** - Each screen securely stores its data using expo-secure-store
4. **Navigation Flow** - Each screen navigates to the next screen in the flow when Continue is pressed

Example pattern:

```jsx
// State management
const [localState, setLocalState] = useState(formData.existingData || []);

// Handle continue
const handleContinue = async () => {
  // Update form context
  updateFormData({
    newData: localState
  });
  
  // Securely store data
  try {
    const data = JSON.stringify({ key: localState });
    await SecureStore.setItemAsync('storage_key', data);
  } catch (error) {
    console.error('Error storing data:', error);
  }
  
  // Navigate to next screen
  router.push('/screens/tracking/next-screen');
};
```

## Styling Patterns

All screens use a consistent set of styles defined in each component's StyleSheet.

```jsx
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
  // ... other consistent styles
});
```

## API Data Model

When submitting data to the API, the following structure is used:

```js
{
  time: Date, // When the BFRB happened 
  duration: Number, // How long it lasted in minutes
  urgeStrength: Number, // 1-10 scale
  intentionType: String, // 'automatic' or 'intentional'
  selectedEnvironments: Array, // Where it happened
  selectedEmotions: Array, // Emotional state
  selectedSensations: Array, // Physical sensations
  selectedThoughts: Array, // Thought patterns
  selectedSensoryTriggers: Array, // Sensory triggers
  notes: String, // Additional notes
  // Additional details fields
  mentalDetails: String,
  physicalDetails: String,
  thoughtDetails: String,
  environmentDetails: String,
  sensoryDetails: String,
  // User information
  userName: String,
  user_id: ObjectId
}
```

## Accessibility Considerations

All screens implement standard accessibility features:

1. All interactive elements have appropriate `accessibilityLabel` and `accessibilityRole` attributes
2. Selected items include `accessibilityState={{ selected: true }}` for screen readers
3. Proper color contrast is maintained throughout the UI
4. Touch targets are sufficiently large (minimum 44x44 points)
5. Semantic structure is used with proper headings and descriptions
