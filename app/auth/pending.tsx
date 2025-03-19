import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PendingAccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get message from route params, or use default
  const message = params.message as string || 'Your access is pending approval.';
  
  // Function to handle requesting access via email
  const handleRequestAccess = async () => {
    const subject = encodeURIComponent('Armatillo App Access Request');
    const body = encodeURIComponent('Hello,\n\nI would like to request access to the Armatillo app.\n\nThank you.');
    
    // Open default email app
    const emailUrl = `mailto:josef@feztech.io?subject=${subject}&body=${body}`;
    
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        console.error('Cannot open email client');
      }
    } catch (error) {
      console.error('Error opening email client:', error);
    }
  };
  
  // Function to go back to login screen
  const handleGoBack = () => {
    router.replace('/login');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/armatillo-placeholder-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Access Pending</Text>
        
        <View style={styles.messageCard}>
          <Text style={styles.message}>{message}</Text>
        </View>
        
        <Text style={styles.description}>
          Armatillo is currently in limited beta testing. Please contact the developer to request access.
        </Text>
        
        <TouchableOpacity onPress={handleRequestAccess} style={styles.requestButton}>
          <Ionicons name="mail-outline" size={18} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.requestButtonText}>Request Access via Email</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleGoBack} style={styles.backToLoginButton}>
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
      
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2a9d8f',
  },
  messageCard: {
    backgroundColor: '#e8f4f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#2a9d8f',
  },
  message: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  requestButton: {
    backgroundColor: '#2a9d8f',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backToLoginButton: {
    padding: 12,
  },
  backToLoginText: {
    color: '#666',
    fontSize: 16,
  },
});
