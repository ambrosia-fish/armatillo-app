export interface OptionItem {
  id: string;
  label: string;
  emoji: string;
}

// Dictionary for environment/location options
export const locationOptions: OptionItem[] = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'school', label: 'School', emoji: '🏫' },
  { id: 'car', label: 'Car', emoji: '🚗' },
  { id: 'public', label: 'Public', emoji: '🏙️' },
  { id: 'bathroom', label: 'Bathroom', emoji: '🚿' },
  { id: 'bedroom', label: 'Bedroom', emoji: '🛏️' },
  { id: 'kitchen', label: 'Kitchen', emoji: '🍽️' },
  { id: 'livingRoom', label: 'Living Room', emoji: '🛋️' },
  { id: 'outdoors', label: 'Outdoors', emoji: '🌳' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍴' },
  { id: 'cafe', label: 'Cafe', emoji: '☕' },
  { id: 'store', label: 'Store', emoji: '🛒' },
  { id: 'library', label: 'Library', emoji: '📚' },
  { id: 'gym', label: 'Gym', emoji: '🏋️' },
];

// Dictionary for activity options
export const activityOptions: OptionItem[] = [
  { id: 'working', label: 'Working', emoji: '💻' },
  { id: 'studying', label: 'Studying', emoji: '📚' },
  { id: 'reading', label: 'Reading', emoji: '📖' },
  { id: 'watching', label: 'Watching TV', emoji: '📺' },
  { id: 'browsing', label: 'Browsing Phone', emoji: '📱' },
  { id: 'socializing', label: 'Socializing', emoji: '👥' },
  { id: 'eating', label: 'Eating', emoji: '🍽️' },
  { id: 'commuting', label: 'Commuting', emoji: '🚌' },
  { id: 'exercising', label: 'Exercising', emoji: '🏃' },
  { id: 'resting', label: 'Resting', emoji: '😴' },
  { id: 'grooming', label: 'Grooming', emoji: '🪞' },
  { id: 'meeting', label: 'In a Meeting', emoji: '👔' },
  { id: 'waiting', label: 'Waiting', emoji: '⏱️' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳' },
];

// Dictionary for emotion options
export const emotionOptions: OptionItem[] = [
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
  { id: 'worry', label: 'Worried', emoji: '😟' },
  { id: 'restless', label: 'Restless', emoji: '😬' },
  { id: 'guilty', label: 'Guilty', emoji: '😣' },
  { id: 'ashamed', label: 'Ashamed', emoji: '😞' },
  { id: 'lonely', label: 'Lonely', emoji: '🥺' },
  { id: 'fearful', label: 'Fearful', emoji: '😨' },
];

// Dictionary for thought pattern options
export const thoughtOptions: OptionItem[] = [
  { id: 'perfectionism', label: 'Perfectionism', emoji: '✨' },
  { id: 'selfCritical', label: 'Self-Critical', emoji: '👎' },
  { id: 'worrying', label: 'Worrying', emoji: '😟' },
  { id: 'ruminating', label: 'Ruminating', emoji: '🔄' },
  { id: 'allOrNothing', label: 'All-or-Nothing', emoji: '⚫️⚪️' },
  { id: 'catastrophizing', label: 'Catastrophizing', emoji: '💥' },
  { id: 'comparing', label: 'Comparing', emoji: '⚖️' },
  { id: 'shouldStatements', label: 'Should Statements', emoji: '📝' },
  { id: 'mindReading', label: 'Mind Reading', emoji: '🔮' },
  { id: 'blackAndWhite', label: 'Black & White', emoji: '🌓' },
  { id: 'personalizing', label: 'Personalizing', emoji: '🎯' },
  { id: 'needForControl', label: 'Need for Control', emoji: '🎮' },
  { id: 'appearance', label: 'Appearance Concerns', emoji: '👀' },
  { id: 'fixing', label: 'Fixing/Evening Out', emoji: '🛠️' },
  { id: 'symmetryConcerns', label: 'Symmetry Concerns', emoji: '↔️' },
];

// Dictionary for physical sensation options
export const sensationOptions: OptionItem[] = [
  { id: 'tense', label: 'Tense Muscles', emoji: '💪' },
  { id: 'sweaty', label: 'Sweaty', emoji: '💦' },
  { id: 'restless', label: 'Restless', emoji: '🦵' },
  { id: 'shaky', label: 'Shaky', emoji: '👐' },
  { id: 'heartRacing', label: 'Heart Racing', emoji: '💓' },
  { id: 'breathing', label: 'Fast Breathing', emoji: '😮‍💨' },
  { id: 'hot', label: 'Hot', emoji: '🔥' },
  { id: 'cold', label: 'Cold', emoji: '❄️' },
  { id: 'tired', label: 'Physically Tired', emoji: '🥱' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'itchy', label: 'Itchy', emoji: '👆' },
  { id: 'tingling', label: 'Tingling', emoji: '✨' },
  { id: 'pain', label: 'Pain', emoji: '🤕' },
  { id: 'pressure', label: 'Pressure', emoji: '👇' },
  { id: 'twitching', label: 'Twitching', emoji: '👁️' },
];

// Dictionary for awareness types
export const awarenessOptions: OptionItem[] = [
  { id: 'intentional', label: 'Intentional', emoji: '🧠' },
  { id: 'automatic', label: 'Automatic', emoji: '🤖' },
];

// Dictionary for urge strength
export const urgeStrengthOptions: OptionItem[] = [
  { id: '1', label: '1 - Very Weak', emoji: '😌' },
  { id: '2', label: '2 - Mild', emoji: '🙂' },
  { id: '3', label: '3 - Moderate', emoji: '😐' },
  { id: '4', label: '4 - Strong', emoji: '😟' },
  { id: '5', label: '5 - Very Strong', emoji: '😖' },
];

// Create a wrapper object for default export
const OptionDictionaries = {
  locationOptions,
  activityOptions,
  emotionOptions,
  thoughtOptions,
  sensationOptions,
  awarenessOptions,
  urgeStrengthOptions
};

export default OptionDictionaries;