import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSubscriptionStatus, SubscriptionStatusResponse } from '../services/subscriptionService';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatusResponse | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubscriptionStatus = async () => {
    // Only load subscription status if user is authenticated
    if (!isAuthenticated) {
      setSubscriptionStatus({
        is_subscribed: false,
        subscription_status: 'none',
        subscription_plan: '',
        days_remaining: 0,
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription status');
      // Set default values if subscription check fails
      setSubscriptionStatus({
        is_subscribed: false,
        subscription_status: 'none',
        subscription_plan: '',
        days_remaining: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = async () => {
    await loadSubscriptionStatus();
  };

  useEffect(() => {
    // Only load subscription status when authentication is complete and user is authenticated
    if (!authLoading) {
      loadSubscriptionStatus();
    }
  }, [isAuthenticated, authLoading]);

  const value: SubscriptionContextType = {
    subscriptionStatus,
    isSubscribed: subscriptionStatus?.is_subscribed || false,
    isLoading,
    error,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};