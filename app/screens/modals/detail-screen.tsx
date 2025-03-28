import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextStyle, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header, Card, Button } from '../../components';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ensureValidToken } from '../../utils/tokenRefresher';
import theme from '../../constants/theme';

// Define the Instance type
interface Instance {
  _id: string;
  userId?: string;
  createdAt: string;
  time?: Date;
  urgeStrength?: number;
  intentionType?: string;
  duration?: string | number;
  timeAgo?: string;
  selectedEnvironments?: string[];
  selectedEmotions?: string[];
  selectedSensations?: string[];
  selectedThoughts?: string[];
  notes?: string;
}

export default function DetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstance = async () => {
      if (!id) {
        setError('No instance ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await ensureValidToken();
        const data = await api.instances.getInstance(id as string);
        setInstance(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching instance details:', err);
        setError('Failed to load instance details');
        setLoading(false);
        
        Alert.alert(
          'Error',
          'Failed to load instance details. Please try again.',
          [{ text: 'OK' }]
        );
      }
    };

    fetchInstance();
  }, [id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get the behavior type (automatic/intentional)
  const getBehaviorType = () => {
    if (instance?.intentionType) {
      return instance.intentionType === 'automatic' ? 'Automatic' : 'Intentional';
    }
    return 'Not specified';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header 
        title="Instance Details"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      {loading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      ) : error ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Retry"
            variant="primary"
            onPress={() => {
              if (id) {
                setLoading(true);
                setError(null);
                api.instances.getInstance(id as string)
                  .then(data => setInstance(data))
                  .catch(err => {
                    console.error(err);
                    setError('Failed to load details. Please try again.');
                  })
                  .finally(() => setLoading(false));
              }
            }}
            style={styles.retryButton}
          />
        </View>
      ) : instance ? (
        <ScrollView style={styles.content}>
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>When</Text>
            <Text style={styles.dateText}>{formatDate(instance.createdAt)}</Text>
            
            {instance.duration && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Duration:</Text>
                <Text style={styles.infoValue}>
                  {typeof instance.duration === 'number' ? 
                    `${instance.duration} ${instance.duration === 1 ? 'minute' : 'minutes'}` : 
                    instance.duration}
                </Text>
              </View>
            )}
          </Card>
          
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>BFRB Details</Text>
            
            {instance.urgeStrength !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Urge Strength:</Text>
                <Text style={styles.infoValue}>{instance.urgeStrength}/10</Text>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>{getBehaviorType()}</Text>
            </View>
          </Card>
          
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Environment</Text>
            
            {instance.selectedEnvironments && instance.selectedEnvironments.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Environments:</Text>
                <View style={styles.tagContainer}>
                  {instance.selectedEnvironments.map((env, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{env}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>
          
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Mental & Physical State</Text>
            
            {instance.selectedEmotions && instance.selectedEmotions.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Feelings:</Text>
                <View style={styles.tagContainer}>
                  {instance.selectedEmotions.map((emotion, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{emotion}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {instance.selectedSensations && instance.selectedSensations.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Physical Sensations:</Text>
                <View style={styles.tagContainer}>
                  {instance.selectedSensations.map((sensation, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{sensation}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {instance.selectedThoughts && instance.selectedThoughts.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Thoughts:</Text>
                <View style={styles.tagContainer}>
                  {instance.selectedThoughts.map((thought, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{thought}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>
          
          {instance.notes && (
            <Card containerStyle={styles.card}>
              <Text style={styles.cardTitle}>Notes</Text>
              <Text style={styles.notesText}>{instance.notes}</Text>
            </Card>
          )}
        </ScrollView>
      ) : (
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyStateText}>No instance details found</Text>
        </View>
      )}
      
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  } as ViewStyle,
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  } as ViewStyle,
  card: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  } as ViewStyle,
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  } as TextStyle,
  dateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  } as ViewStyle,
  infoLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium as '500',
    marginRight: theme.spacing.md,
    minWidth: 120,
  } as TextStyle,
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    flex: 1,
  } as TextStyle,
  tagContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  } as ViewStyle,
  tag: {
    backgroundColor: theme.colors.primary.light,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    margin: 2,
  } as ViewStyle,
  tagText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.dark,
  } as TextStyle,
  notesText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed,
  } as TextStyle,
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  emptyStateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  } as TextStyle,
  errorText: {
    color: theme.colors.utility.error,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.md,
  } as TextStyle,
  retryButton: {
    marginTop: theme.spacing.md,
  } as ViewStyle,
});