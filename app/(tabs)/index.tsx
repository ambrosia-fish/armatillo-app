import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const addNewEntry = () => {
    // Logic for adding a new entry
    console.log('Add new entry');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Armatillo</Text>
      <Text style={styles.subtitle}>BFRB Habit Reversal Tracker</Text>
      
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome!</Text>
        <Text style={styles.welcomeText}>
          Track your BFRB habits and record your progress with habit reversal training.
        </Text>
      </View>
      
      <TouchableOpacity style={styles.addButton} onPress={addNewEntry}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2a9d8f',
    justifyContent: 'center',
    alignItems: 'center',
  },
});