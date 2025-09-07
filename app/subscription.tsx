import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import {
  getSubscriptionPlans,
  getSubscriptionStatus,
  getSubscriptionDetails,
  createSubscription,
  cancelSubscription,
  createBillingPortal,
  SubscriptionPlan,
  UserSubscription,
  SubscriptionStatusResponse,
} from './services/subscriptionService';

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [plansResponse, statusResponse, detailsResponse] = await Promise.all([
        getSubscriptionPlans(),
        getSubscriptionStatus(),
        getSubscriptionDetails(),
      ]);
      
      setPlans(plansResponse.plans);
      setSubscriptionStatus(statusResponse);
      setSubscription(detailsResponse.subscription || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setSaving(true);
      const response = await createSubscription(planId);
      
      // Open Stripe Checkout in browser
      const supported = await Linking.canOpenURL(response.url);
      if (supported) {
        await Linking.openURL(response.url);
      } else {
        Alert.alert('Error', 'Cannot open payment page');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to AI features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await cancelSubscription(true);
              Alert.alert('Success', 'Subscription will be canceled at the end of your billing period');
              await loadData(); // Refresh data
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to cancel subscription');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleManageBilling = async () => {
    try {
      setSaving(true);
      const response = await createBillingPortal();
      
      // Open Stripe Billing Portal in browser
      const supported = await Linking.canOpenURL(response.url);
      if (supported) {
        await Linking.openURL(response.url);
      } else {
        Alert.alert('Error', 'Cannot open billing portal');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setSaving(false);
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrentPlan = subscription?.plan.id === plan.id;
    const isSubscribed = subscriptionStatus?.is_subscribed;
    
    return (
      <View key={plan.id} style={[styles.planCard, isCurrentPlan && styles.currentPlanCard]}>
        {isCurrentPlan && (
          <View style={styles.currentPlanBadge}>
            <Text style={styles.currentPlanBadgeText}>Current Plan</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.planPrice}>
            <Text style={styles.planPriceAmount}>${plan.price}</Text>
            <Text style={styles.planPricePeriod}>/{plan.plan_type}</Text>
          </View>
        </View>
        
        {plan.description && (
          <Text style={styles.planDescription}>{plan.description}</Text>
        )}
        
        <View style={styles.planFeatures}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.planFeature}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.planFeatureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        {plan.trial_days > 0 && (
          <View style={styles.trialBadge}>
            <Text style={styles.trialText}>{plan.trial_days} days free trial</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            isCurrentPlan && styles.currentPlanButton,
            isSubscribed && !isCurrentPlan && styles.upgradeButton,
          ]}
          onPress={() => handleSubscribe(plan.id)}
          disabled={saving || isCurrentPlan}
        >
          <Text style={[
            styles.subscribeButtonText,
            isCurrentPlan && styles.currentPlanButtonText,
            isSubscribed && !isCurrentPlan && styles.upgradeButtonText,
          ]}>
            {isCurrentPlan ? 'Current Plan' : isSubscribed ? 'Upgrade' : 'Subscribe'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSubscriptionStatus = () => {
    if (!subscriptionStatus?.is_subscribed || !subscription) {
      return null;
    }

    return (
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.statusTitle}>Active Subscription</Text>
        </View>
        
        <View style={styles.statusDetails}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Plan:</Text>
            <Text style={styles.statusValue}>{subscription.plan.name}</Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusValue, styles.statusActive]}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </Text>
          </View>
          
          {subscription.current_period_end && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Next billing:</Text>
              <Text style={styles.statusValue}>
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </Text>
            </View>
          )}
          
          {subscription.days_remaining > 0 && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Days remaining:</Text>
              <Text style={styles.statusValue}>{subscription.days_remaining} days</Text>
            </View>
          )}
        </View>
        
        <View style={styles.statusActions}>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={handleManageBilling}
            disabled={saving}
          >
            <Ionicons name="card" size={20} color="#A26FFD" />
            <Text style={styles.manageButtonText}>Manage Billing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}
            disabled={saving}
          >
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A26FFD" />
        <Text style={styles.loadingText}>Loading subscription plans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Subscription Status */}
        {renderSubscriptionStatus()}

        {/* Subscription Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {subscriptionStatus?.is_subscribed ? 'Available Plans' : 'Choose Your Plan'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {subscriptionStatus?.is_subscribed 
              ? 'Upgrade or change your current plan'
              : 'Unlock AI-powered meal and workout plans'
            }
          </Text>
          
          <View style={styles.plansContainer}>
            {plans.map(renderPlanCard)}
          </View>
        </View>

        {/* Features Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Get</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="sparkles" size={20} color="#A26FFD" />
              <Text style={styles.featureText}>AI-generated meal plans tailored to your goals</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="fitness" size={20} color="#A26FFD" />
              <Text style={styles.featureText}>AI-generated workout plans for any fitness level</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={20} color="#A26FFD" />
              <Text style={styles.featureText}>Advanced progress tracking and analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="headset" size={20} color="#A26FFD" />
              <Text style={styles.featureText}>Priority customer support</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#A26FFD',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  statusDetails: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  statusActive: {
    color: '#10B981',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 12,
  },
  manageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#A26FFD20',
    borderWidth: 1,
    borderColor: '#A26FFD',
  },
  manageButtonText: {
    color: '#A26FFD',
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 4,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  currentPlanCard: {
    borderColor: '#A26FFD',
    backgroundColor: '#faf5ff',
  },
  currentPlanBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#A26FFD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentPlanBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPriceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A26FFD',
  },
  planPricePeriod: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  planFeatures: {
    marginBottom: 16,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 8,
    flex: 1,
  },
  trialBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  trialText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  subscribeButton: {
    backgroundColor: '#A26FFD',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: '#e0e0e0',
  },
  upgradeButton: {
    backgroundColor: '#10B981',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentPlanButtonText: {
    color: '#666',
  },
  upgradeButtonText: {
    color: '#fff',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 12,
    flex: 1,
  },
});