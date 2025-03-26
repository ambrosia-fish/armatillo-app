import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  
  const addNewEntry = () => {
    // Navigate to the time screen
    router.push('/time-screen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Armatillo</Text>
      <Text style={styles.subtitle}>BFRB Habit Reversal Tracker</Text>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/armatillo-placeholder-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome!</Text>
        <Text style={styles.welcomeText}>
          Track your BFRB habits and record your progress with habit reversal training.
        </Text>
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
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.colors.text.secondary,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 200,
    height: 200,
  },
  welcomeCard: {
    ...theme.componentStyles.card.container,
    marginBottom: theme.spacing.xl,
  },
  welcomeTitle: {
    ...theme.componentStyles.card.title,
  },
  welcomeText: {
    ...theme.componentStyles.card.content,
    lineHeight: theme.typography.lineHeight.normal,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: theme.spacing.xxxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
});