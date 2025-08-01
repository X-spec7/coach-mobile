import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { resendVerificationEmail, verifyEmail } from '../services/auth';

export default function EmailVerificationScreen() {
  const params = useLocalSearchParams();
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  
  const userEmail = (params.email as string) || email || '';

  // Check if we need to show email input (when no email is provided from registration)
  React.useEffect(() => {
    if (!params.email) {
      setShowEmailInput(true);
    }
  }, [params.email]);

  const handleVerifyEmail = async () => {
    if (!userEmail.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code.');
      return;
    }

    setVerifying(true);
    try {
      await verifyEmail(userEmail, verificationCode.trim());
      
      Alert.alert(
        'Email Verified Successfully!',
        'Your email has been verified. You can now sign in to your account.',
        [
          {
            text: 'Sign In',
            onPress: () => {
              router.replace('/(auth)/sign-in');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error verifying email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify email';
      Alert.alert(
        'Verification Failed',
        errorMessage,
        [{ text: 'Try Again', style: 'default' }]
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail.trim()) {
      Alert.alert('Error', 'Please enter your email address first.');
      return;
    }

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
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          {userEmail ? (
            <>
              We've sent a verification code to{'\n'}
              <Text style={styles.emailText}>{userEmail}</Text>
            </>
          ) : (
            'Enter your email address and verification code below'
          )}
        </Text>

        {/* Email Input (only show if no email from registration) */}
        {showEmailInput && (
          <View style={styles.emailInputContainer}>
            <Text style={styles.emailInputLabel}>Email Address</Text>
            <TextInput
              style={styles.emailInput}
              placeholder="Enter your email address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {/* Verification Code Input */}
        <View style={styles.codeInputContainer}>
          <Text style={styles.codeInputLabel}>Enter Verification Code</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="000000"
            placeholderTextColor="#999"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
            autoFocus={!showEmailInput}
          />
          <Text style={styles.codeInputHint}>Enter the 6-digit code from your email</Text>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, (!userEmail.trim() || !verificationCode.trim() || verifying) && styles.buttonDisabled]}
          onPress={handleVerifyEmail}
          disabled={!userEmail.trim() || !verificationCode.trim() || verifying}
        >
          {verifying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Email</Text>
          )}
        </TouchableOpacity>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>To complete your verification:</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>Check your email inbox</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>Copy the 6-digit verification code</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>Enter the code above and verify</Text>
          </View>
        </View>

        {/* Resend Email */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            {userEmail ? "Didn't receive the email?" : "Need to get a verification code?"}
          </Text>
          <TouchableOpacity 
            onPress={handleResendVerification}
            disabled={resending || !userEmail.trim()}
            style={[styles.resendButton, !userEmail.trim() && styles.buttonDisabled]}
          >
            {resending ? (
              <ActivityIndicator size="small" color="#A78BFA" />
            ) : (
              <Text style={styles.resendButtonText}>
                {userEmail ? "Resend Verification Email" : "Send Verification Email"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackToRegister}
          >
            <Text style={styles.secondaryButtonText}>Change Email Address</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleGoToLogin}
          >
            <Text style={styles.loginButtonText}>Go to Sign In</Text>
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
  emailInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emailInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emailInput: {
    fontSize: 16,
    color: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
    textAlign: 'center',
  },
  codeInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  codeInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
    textAlign: 'center',
  },
  codeInputHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  verifyButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
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