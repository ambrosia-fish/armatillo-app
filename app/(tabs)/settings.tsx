import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Account & Settings</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Ionicons name="moon-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Dark Mode</Text>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow}>
              <Ionicons name="person-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Profile</Text>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingRow}>
              <Ionicons name="log-out-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow}>
              <Ionicons name="information-circle-outline" size={24} color="#333" />
              <Text style={styles.settingText}>About Armatillo</Text>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingRow}>
              <Ionicons name="document-text-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 16,
  },
});