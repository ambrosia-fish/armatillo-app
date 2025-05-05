import { Stack } from 'expo-router';

export default function TrackingLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="new-options-screen" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="new-entry-screen" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="new-strategy-screen" 
        options={{ 
          headerShown: false
        }} 
      />
    </Stack>
  );
}