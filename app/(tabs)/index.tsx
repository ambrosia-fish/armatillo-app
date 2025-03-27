import React from 'react';
import { StyleSheet, TouchableOpacity, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '@/app/constants/theme';
import { View, Text } from '@/app/components';

export default function HomeScreen() {
  const router = useRouter();
  
  const addNewEntry = () => {
    // Navigate to the time screen with updated path
    router.push('/screens/tracking/time-screen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Armatillo</Text>
        <Text style={styles.subtitle}>BFRB Habit Reversal Tracker</Text>
      </View>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/armatillo-placeholder-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Centered Add Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={addNewEntry}>
          <Ionicons name="add" size={32} color={theme.colors.primary.contrast} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  headerContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    textAlign: 'center',
    color: theme.colors.text.primary,
  } as TextStyle,
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  } as TextStyle,
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80, // Add space to account for the add button
  } as ViewStyle,
  logo: {
    width: 280,
    height: 280,
  } as ImageStyle,
  welcomeCard: {
    ...theme.componentStyles.card.container,
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  welcomeTitle: {
    ...theme.componentStyles.card.title,
    fontWeight: theme.typography.fontWeight.bold as '700',
  } as TextStyle,
  welcomeText: {
    ...theme.componentStyles.card.content,
    lineHeight: theme.typography.lineHeight.normal,
  } as TextStyle,
  addButtonContainer: {
    position: 'absolute',
    bottom: theme.spacing.xxxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  } as ViewStyle,
  addButton: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  } as ViewStyle,
});