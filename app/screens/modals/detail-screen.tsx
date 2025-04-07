import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  TextStyle, 
  ViewStyle 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header, Button } from '../../components';
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
  selectedActivities?: string[];
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
  
  // Render a category pill
  const renderPill = (text: string, index: number) => (
    <View key={index} style={styles.pill}>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );

  // Render a section of category pills
  const renderCategorySection = (title: string, items: string[] | undefined) => {
    if (!items || items.length === 0) return null;
    
    return (
      <View style={styles.formSection}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.selectionContainer}>
          {items.map((item, index) => renderPill(item, index))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      
      <Header 
        title="Instance Details" 
        showBackButton
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
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Awareness Type */}
          <View style={styles.formSection}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Awareness Type</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoValue}>{getBehaviorType()}</Text>
            </View>
          </View>
          
          {/* Urge Strength */}
          {instance.urgeStrength !== undefined && (
            <View style={styles.formSection}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Urge Strength</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoValue}>{instance.urgeStrength}/10</Text>
              </View>
            </View>
          )}
          
          {/* Time Info */}
          <View style={styles.formSection}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>When</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoValue}>{formatDate(instance.createdAt)}</Text>
            </View>
          </View>
          
          {/* Duration */}
          {instance.duration && (
            <View style={styles.formSection}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Duration</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoValue}>
                  {typeof instance.duration === 'number' ? 
                    `${instance.duration} ${instance.duration === 1 ? 'minute' : 'minutes'}` : 
                    instance.duration}
                </Text>
              </View>
            </View>
          )}
          
          {/* Location */}
          {renderCategorySection('Location', instance.selectedEnvironments)}
          
          {/* Activity */}
          {renderCategorySection('Activity', instance.selectedActivities)}
          
          {/* Emotions */}
          {renderCategorySection('Emotions', instance.selectedEmotions)}
          
          {/* Thought Patterns */}
          {renderCategorySection('Thought Patterns', instance.selectedThoughts)}
          
          {/* Physical Sensations */}
          {renderCategorySection('Physical Sensations', instance.selectedSensations)}
          
          {/* Notes */}
          {instance.notes && (
            <View style={styles.formSection}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Notes</Text>
              </View>
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{instance.notes}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyStateText}>No instance details found</Text>
        </View>
      )}
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
  } as ViewStyle,
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.huge,
    alignItems: 'center',
  } as ViewStyle,
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  } as ViewStyle,
  formSection: {
    marginBottom: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
  } as ViewStyle,
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    position: 'relative',
    width: '100%',
  } as ViewStyle,
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
  } as TextStyle,
  infoContainer: {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  } as ViewStyle,
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
  } as TextStyle,
  selectionContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    minHeight: 45,
  } as ViewStyle,
  pill: {
    backgroundColor: theme.colors.primary.light + '40',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    margin: theme.spacing.xs,
  } as ViewStyle,
  pillText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,
  notesContainer: {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    marginTop: theme.spacing.sm,
    minHeight: 100,
  } as ViewStyle,
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