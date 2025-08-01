import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { resendVerificationEmail } from '../services/auth';

export default function EmailVerificationScreen() {
  const params = useLocalSearchParams();
  const [resending, setResending] = useState(false);
  
  const userEmail = params.email as string || 'your email';

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await resendVerificationEmail(userEmail);
      
      Alert.alert(
        'Verification Email Sent',
        'We\'ve sent another verification email to your inbox. Please check your email and follow the instructions.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error resending verification email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setResending(false);
    }
  };

  const handleGoToLogin = () => {
    router.replace('/(auth)/sign-in');
  };

  const handleBackToRegister = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBackToRegister} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={80} color="#A78BFA" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification link to{'\n'}
          <Text style={styles.emailText}>{userEmail}</Text>
        </Text>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>To complete your registration:</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>Check your email inbox</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>Click the verification link</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>Return here to sign in</Text>
          </View>
        </View>

        {/* Resend Email */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the email?</Text>
          <TouchableOpacity 
            onPress={handleResendVerification}
            disabled={resending}
            style={styles.resendButton}
          >
            {resending ? (
              <ActivityIndicator size="small" color="#A78BFA" />
            ) : (
              <Text style={styles.resendButtonText}>Resend Verification Email</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleGoToLogin}
          >
            <Text style={styles.loginButtonText}>Go to Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackToRegister}
          >
            <Text style={styles.secondaryButtonText}>Change Email Address</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Make sure to check your spam folder if you don't see the email in your inbox.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#A78BFA',
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  resendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
}); 