import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isSubscribed, isLoading } = useSubscription();

  // If user is not authenticated, show login prompt
  if (!authLoading && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Modal visible={true} transparent animationType="fade">
        <Pressable style={styles.modalOverlay}>
          <View style={styles.subscriptionModal}>
            <View style={styles.modalHeader}>
              <Ionicons name="log-in" size={48} color="#A26FFD" />
              <Text style={styles.modalTitle}>Login Required</Text>
              <Text style={styles.modalSubtitle}>
                Please log in to access AI features
              </Text>
            </View>

            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => router.push('/login-register')}
            >
              <Text style={styles.subscribeButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    );
  }

  if (isLoading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isSubscribed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Modal visible={true} transparent animationType="fade">
        <Pressable style={styles.modalOverlay}>
          <View style={styles.subscriptionModal}>
            <View style={styles.modalHeader}>
              <Ionicons name="lock-closed" size={48} color="#A26FFD" />
              <Text style={styles.modalTitle}>Subscription Required</Text>
              <Text style={styles.modalSubtitle}>
                You need an active subscription to use AI features
              </Text>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="sparkles" size={20} color="#A26FFD" />
                <Text style={styles.featureText}>AI-generated meal plans</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="fitness" size={20} color="#A26FFD" />
                <Text style={styles.featureText}>AI-generated workout plans</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="analytics" size={20} color="#A26FFD" />
                <Text style={styles.featureText}>Advanced progress tracking</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => {
                  router.push('/subscription');
                }}
              >
                <Text style={styles.subscribeButtonText}>View Plans</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subscriptionModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  modalActions: {
    gap: 12,
  },
  subscribeButton: {
    backgroundColor: '#A26FFD',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});