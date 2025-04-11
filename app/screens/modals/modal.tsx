import React from 'react';
import { 
  StatusBar, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle, 
  TextStyle,
  Modal as RNModal,
  Pressable,
  View as RNView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Text, View } from '../../components';
import theme from '../../constants/theme';

export interface ModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;
  
  /**
   * Title to display in the header
   */
  title: string;
  
  /**
   * Function to call when the modal is dismissed
   */
  onClose: () => void;
  
  /**
   * Whether to allow dismissing by tapping outside (default true)
   */
  dismissable?: boolean;
  
  /**
   * Children to render inside the modal body
   */
  children: React.ReactNode;
  
  /**
   * Footer content (optional)
   */
  footer?: React.ReactNode;
  
  /**
   * Additional styling for the content container
   */
  contentStyle?: ViewStyle;
}

/**
 * Standardized modal component for consistent styling across the app
 * 
 * @example
 * ```tsx
 * <ModalComponent 
 *   visible={modalVisible} 
 *   title="Select Option"
 *   onClose={() => setModalVisible(false)}
 * >
 *   <Text>Modal content goes here</Text>
 * </ModalComponent>
 * ```
 */
export default function ModalComponent({
  visible,
  title,
  onClose,
  dismissable = true,
  children,
  footer,
  contentStyle
}: ModalProps) {
  
  /**
   * Close the modal when clicking the backdrop if dismissable
   */
  const handleBackdropPress = () => {
    if (dismissable) {
      onClose();
    }
  };
  
  /**
   * Prevent propagation of touch events within the modal content
   */
  const handleModalContentPress = (e: any) => {
    e.stopPropagation();
  };

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'dark-content'} 
        backgroundColor="rgba(0,0,0,0.5)" 
      />
      
      <Pressable 
        style={styles.backdrop} 
        onPress={handleBackdropPress}
        accessibilityLabel={dismissable ? "Tap to close modal" : undefined}
        accessibilityHint={dismissable ? "Closes the modal dialog" : undefined}
      >
        <RNView 
          style={styles.modalContainer} 
          onStartShouldSetResponder={() => true}
          onTouchEnd={handleModalContentPress}
        >
          <SafeAreaView style={styles.contentContainer} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeButton}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              
              <Text style={styles.title}>{title}</Text>
              
              <RNView style={styles.rightPlaceholder} />
            </View>
            
            {/* Content */}
            <View style={[styles.content, contentStyle]}>
              {children}
            </View>
            
            {/* Footer (if provided) */}
            {footer && (
              <View style={styles.footer}>
                {footer}
              </View>
            )}
          </SafeAreaView>
        </RNView>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  modalContainer: {
    width: Platform.OS === 'web' ? '85%' : '90%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: theme.colors.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  } as ViewStyle,
  
  contentContainer: {
    flex: 0,
    maxHeight: '100%',
  } as ViewStyle,
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  closeButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  } as ViewStyle,
  
  rightPlaceholder: {
    width: 40,
    marginLeft: theme.spacing.sm,
  } as ViewStyle,
  
  title: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
  } as TextStyle,
  
  content: {
    padding: theme.spacing.lg,
    maxHeight: '80%',
  } as ViewStyle,
  
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.secondary,
  } as ViewStyle,
});
