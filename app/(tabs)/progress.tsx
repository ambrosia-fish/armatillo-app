import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Progress & Data</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Summary</Text>
          <Text style={styles.text}>Your progress statistics will appear here.</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trends</Text>
          <Text style={styles.text}>Visualizations of your progress over time will be shown here.</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <Text style={styles.text}>Milestones and achievements will be displayed here.</Text>
        </View>
      </ScrollView>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});