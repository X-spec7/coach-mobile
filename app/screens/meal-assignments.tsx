import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MealService, AppliedMealPlan } from '../services/mealService';

export default function MealAssignmentsScreen() {
  const { user } = useAuth();
  const [appliedPlans, setAppliedPlans] = useState<AppliedMealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    fetchAppliedPlans();
  }, [activeTab]);

  const fetchAppliedPlans = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await MealService.getAppliedMealPlans();
      // Filter based on active tab
      const filteredPlans = response.applied_plans.filter(plan => 
        activeTab === 'active' ? plan.is_active : !plan.is_active
      );
      setAppliedPlans(filteredPlans);
    } catch (error) {
      console.error('Error fetching applied meal plans:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load applied meal plans';
      
      // Don't show alert for authentication errors
      if (!errorMessage.includes('Authentication required')) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAppliedPlans(true);
  };

  const handleDeactivatePlan = async (appliedPlan: AppliedMealPlan) => {
    Alert.alert(
      'Deactivate Meal Plan',
      `Are you sure you want to deactivate "${appliedPlan.meal_plan?.title || 'this meal plan'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await MealService.deactivateAppliedMealPlan(appliedPlan.id);
              Alert.alert('Success', 'Meal plan deactivated successfully.');
              fetchAppliedPlans();
            } catch (error) {
              console.error('Error deactivating meal plan:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate meal plan';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDays = (days: string[]) => {
    const dayNames: { [key: string]: string } = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };
    return days.map(day => dayNames[day] || day).join(', ');
  };

  const renderAppliedPlan = (appliedPlan: AppliedMealPlan) => (
    <View key={appliedPlan.id} style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <View style={styles.planInfo}>
          <Text style={styles.planTitle}>
            {appliedPlan.meal_plan?.title || 'Meal Plan'}
          </Text>
          <Text style={styles.sourceText}>
            {appliedPlan.source_display}
            {appliedPlan.assigned_by_coach_name && (
              <Text style={styles.coachName}> by {appliedPlan.assigned_by_coach_name}</Text>
            )}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: appliedPlan.is_active ? '#4CAF50' : '#666' }
          ]}>
            <Text style={styles.statusText}>
              {appliedPlan.is_active ? 'Active' : 'Completed'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.assignmentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            Started: {formatDate(appliedPlan.start_date)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {appliedPlan.weeks_count} weeks • {formatDays(appliedPlan.selected_days)}
          </Text>
        </View>

        {appliedPlan.meal_plan && (
          <View style={styles.detailRow}>
            <Ionicons name="flame-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {appliedPlan.meal_plan.total_calories} cal
            </Text>
          </View>
        )}
      </View>

      {appliedPlan.is_active && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.deactivateButton}
            onPress={() => handleDeactivatePlan(appliedPlan)}
          >
            <Ionicons name="stop-circle-outline" size={16} color="#FF6B6B" />
            <Text style={styles.deactivateButtonText}>Deactivate</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="restaurant-outline" 
        size={64} 
        color="#ccc" 
      />
      <Text style={styles.emptyTitle}>
        No {activeTab} meal plans
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'active' 
          ? "You don't have any active meal plans."
          : "You don't have any completed meal plans."}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Plan Assignments</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A78BFA" />
            <Text style={styles.loadingText}>Loading meal plans...</Text>
          </View>
        ) : appliedPlans.length > 0 ? (
          <View style={styles.assignmentsList}>
            {appliedPlans.map(renderAppliedPlan)}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  },
  placeholder: {
    width: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#A78BFA',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  assignmentsList: {
    gap: 16,
  },
  assignmentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 14,
    color: '#666',
  },
  coachName: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  assignmentDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  deactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    gap: 4,
  },
  deactivateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});