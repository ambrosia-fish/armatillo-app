import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PendingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Get message from URL params
    if (params.message) {
      setMessage(decodeURIComponent(params.message as string));
    } else {
      setMessage('Your access request is pending approval.');
    }
  }, [params]);

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@armatillo.com?subject=Test%20User%20Access%20Request');
  };

  const handleGoBack = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        {/* Logo and app name */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.appName}>Armatillo</Text>
          <Text style={styles.tagline}>Access Pending</Text>
        </View>
        
        {/* Message */}
        <View style={styles.messageContainer}>
          <Ionicons name="time-outline" size={48} color="#2a9d8f" />
          <Text style={styles.messageTitle}>Thank You</Text>
          <Text style={styles.messageText}>{message}</Text>
          
          <Text style={styles.infoText}>
            Armatillo is currently in a closed testing phase. We'll notify you when your access is approved.
          </Text>
          
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2a9d8f',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 40,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    color: '#444',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2a9d8f',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  supportButtonText: {
    color: '#2a9d8f',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
