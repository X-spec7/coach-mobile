import { getAuthHeaders } from './api';

const API_BASE_URL = 'http://52.15.195.49:8000';

// Types for Stripe Subscription
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  stripe_price_id: string;
  stripe_product_id: string;
  price: string;
  currency: string;
  plan_type: 'monthly' | 'yearly' | 'lifetime';
  interval_count: number;
  trial_days: number;
  is_active: boolean;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  plan: SubscriptionPlan;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: 'incomplete' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
  current_period_start?: string;
  current_period_end?: string;
  trial_start?: string;
  trial_end?: string;
  canceled_at?: string;
  cancel_at_period_end: boolean;
  is_active: boolean;
  is_trial: boolean;
  days_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  stripe_payment_intent_id: string;
  amount: string;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'canceled';
  description?: string;
  created_at: string;
}

export interface PlansResponse {
  message: string;
  plans: SubscriptionPlan[];
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface SubscriptionStatusResponse {
  is_subscribed: boolean;
  subscription_status: string;
  subscription_plan: string;
  subscription_end_date?: string;
  trial_end_date?: string;
  days_remaining: number;
}

export interface SubscriptionDetailsResponse {
  message: string;
  subscription?: UserSubscription;
}

export interface SubscriptionResponse {
  message: string;
  subscription: UserSubscription;
}

export interface BillingPortalResponse {
  url: string;
}

export interface PaymentHistoryResponse {
  message: string;
  payments: PaymentHistory[];
}

// Get available subscription plans
export const getSubscriptionPlans = async (): Promise<PlansResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/subscription/plans/`, {
      method: 'GET',
      headers,
    });

    console.log('Subscription plans response status:', response.status);

    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch subscription plans`);
      } else {
        // Response is not JSON (likely HTML error page)
        const textResponse = await response.text();
        console.error('Non-JSON response from subscription plans:', textResponse.substring(0, 200));
        throw new Error(`HTTP ${response.status}: Server returned HTML instead of JSON. Check if subscription endpoint exists.`);
      }
    }

    const data = await response.json();
    console.log('Subscription plans response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

// Create subscription checkout session
export const createSubscription = async (planId: string): Promise<CheckoutSessionResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/subscription/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ plan_id: planId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Get subscription status
export const getSubscriptionStatus = async (): Promise<SubscriptionStatusResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/subscription/status/`, {
      method: 'GET',
      headers,
    });

    console.log('Subscription status response status:', response.status);

    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch subscription status`);
      } else {
        // Response is not JSON (likely HTML error page)
        const textResponse = await response.text();
        console.error('Non-JSON response from subscription status:', textResponse.substring(0, 200));
        throw new Error(`HTTP ${response.status}: Server returned HTML instead of JSON. Check if subscription endpoint exists.`);
      }
    }

    const data = await response.json();
    console.log('Subscription status response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    throw error;
  }
};

// Get subscription details
export const getSubscriptionDetails = async (): Promise<SubscriptionDetailsResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/subscription/details/`, {
      method: 'GET',
      headers,
    });

    console.log('Subscription details response status:', response.status);
    console.log('Subscription details response headers:', response.headers);

    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch subscription details`);
      } else {
        // Response is not JSON (likely HTML error page)
        const textResponse = await response.text();
        console.error('Non-JSON response from subscription details:', textResponse.substring(0, 200));
        throw new Error(`HTTP ${response.status}: Server returned HTML instead of JSON. Check if subscription endpoint exists.`);
      }
    }

    const data = await response.json();
    console.log('Subscription details response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw error;
  }
};

// Update subscription
export const updateSubscription = async (planId: string): Promise<SubscriptionResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/subscription/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ plan_id: planId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (atPeriodEnd: boolean = true): Promise<SubscriptionResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/subscription/cancel/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ at_period_end: atPeriodEnd }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Create billing portal session
export const createBillingPortal = async (): Promise<BillingPortalResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/subscription/billing-portal/`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create billing portal session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw error;
  }
};

// Get payment history
export const getPaymentHistory = async (): Promise<PaymentHistoryResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/subscription/payment-history/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch payment history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};