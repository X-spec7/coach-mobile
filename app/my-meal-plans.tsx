import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MealService, MealPlan } from './services/mealService';
import { getMealPlans, updateMealPlan, applyMealPlan } from './services/mealPlanManagementService';
import { CreateMealPlanModal } from './modals/CreateMealPlanModal';
import { MealPlanDetailsModal } from './modals/MealPlanDetailsModal';
import { ApplyMealPlanModal } from './modals/ApplyMealPlanModal';
import AssignMealPlanModal from './modals/AssignMealPlanModal';
import { useAuth } from './contexts/AuthContext';

export default function MyMealPlansScreen() {
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'ai_generated'>('all');

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await MealService.getMealPlans();
      setMealPlans(response.meal_plans);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load meal plans';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('User not authenticated, skipping meal plans fetch');
        setMealPlans([]);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchMealPlans(true);
  };

  const handlePlanPress = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  };

  const handlePublishPlan = async (plan: MealPlan) => {
    try {
      await updateMealPlan(plan.id, { status: 'published' });
      await fetchMealPlans();
      Alert.alert('Success', 'Meal plan published successfully!');
    } catch (error) {
      console.error('Error publishing meal plan:', error);
      Alert.alert('Error', 'Failed to publish meal plan');
    }
  };

  const handleEditPlan = (plan: MealPlan) => {
    // Navigate to edit page (we'll create this later)
    router.push(`/edit-meal-plan/${plan.id}` as any);
  };

  const filteredPlans = mealPlans.filter(plan => {
    switch (filter) {
      case 'draft':
        return plan.status === 'draft';
      case 'published':
        return plan.status === 'published';
      case 'ai_generated':
        return plan.is_ai_generated;
      default:
        return true;
    }
  });

  const handleDeletePlan = async (planId: string, planTitle: string) => {
    Alert.alert(
      'Delete Meal Plan',
      `Are you sure you want to delete "${planTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await MealService.deleteMealPlan(planId);
              await fetchMealPlans();
            } catch (error) {
              console.error('Error deleting meal plan:', error);
              Alert.alert('Error', 'Failed to delete meal plan');
            }
          },
        },
      ]
    );
  };

  const handleChoosePlan = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(false);
    setShowApplyModal(true);
  };

  const handleAssignPlan = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(false);
    setShowAssignModal(true);
  };

  const renderMealPlan = (plan: MealPlan) => (
    <TouchableOpacity
      key={plan.id}
      style={styles.planCard}
      onPress={() => handlePlanPress(plan)}
    >
      <View style={styles.planContent}>
        <View style={styles.planInfo}>
          <View style={styles.planHeader}>
            <View style={styles.planTitleContainer}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              {plan.is_ai_generated && (
                <View style={styles.aiBadge}>
                  <Ionicons name="sparkles" size={12} color="#FF6B6B" />
                  <Text style={styles.aiBadgeText}>AI</Text>
                </View>
              )}
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: plan.status === 'published' ? '#4CAF50' : '#FFA726' }
            ]}>
              <Text style={styles.statusText}>{plan.status_display}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeletePlan(plan.id, plan.title);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
          {plan.description && (
            <Text style={styles.planDescription} numberOfLines={2}>
              {plan.description}
            </Text>
          )}
          <View style={styles.planStats}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {plan.daily_plans?.length || 0} days
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {plan.total_calories || 0} cal
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="nutrition-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                P: {Math.round(plan.total_protein || 0)}g
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="leaf-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                C: {Math.round(plan.total_carbs || 0)}g
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                F: {Math.round(plan.total_fat || 0)}g
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {new Date(plan.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          {/* Action buttons for AI-generated plans */}
          {plan.is_ai_generated && (
            <View style={styles.actionButtons}>
              {plan.status === 'draft' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditPlan(plan);
                  }}
                >
                  <Ionicons name="create-outline" size={16} color="#2196F3" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
              
              {plan.status === 'draft' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.publishButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handlePublishPlan(plan);
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                  <Text style={styles.actionButtonText}>Publish</Text>
                </TouchableOpacity>
              )}
              
              {plan.status === 'published' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.applyButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleChoosePlan(plan);
                  }}
                >
                  <Ionicons name="calendar-outline" size={16} color="#FF9800" />
                  <Text style={styles.actionButtonText}>Apply</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMealPlansStats = () => {
    const totalPlans = mealPlans.length;
    const publishedPlans = mealPlans.filter(plan => plan.status === 'published').length;
    const totalCalories = mealPlans.reduce((sum, plan) => sum + plan.total_calories, 0);
    const avgProtein = mealPlans.length > 0 ? Math.round(mealPlans.reduce((sum, plan) => sum + plan.total_protein, 0) / mealPlans.length) : 0;

    return (
      <View style={styles.plansStatsContainer}>
        <View style={styles.planStatCard}>
          <Text style={styles.planStatValue}>{totalPlans}</Text>
          <Text style={styles.planStatLabel}>Total Plans</Text>
        </View>
        <View style={styles.planStatCard}>
          <Text style={styles.planStatValue}>{publishedPlans}</Text>
          <Text style={styles.planStatLabel}>Published</Text>
        </View>
        <View style={styles.planStatCard}>
          <Text style={styles.planStatValue}>{totalCalories}</Text>
          <Text style={styles.planStatLabel}>Total Calories</Text>
        </View>
        <View style={styles.planStatCard}>
          <Text style={styles.planStatValue}>{avgProtein}g</Text>
          <Text style={styles.planStatLabel}>Avg Protein</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={48} color="#666" />
      <Text style={styles.emptyStateTitle}>No Meal Plans Yet</Text>
      <Text style={styles.emptyStateText}>
        Create your first meal plan to get started
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.emptyStateButtonText}>Create Your First Plan</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Meal Plans</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#A78BFA" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#A78BFA"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A78BFA" />
            <Text style={styles.loadingText}>Loading meal plans...</Text>
          </View>
        ) : mealPlans.length > 0 ? (
          <View style={styles.content}>
            {/* Filter buttons */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                onPress={() => setFilter('all')}
              >
                <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'draft' && styles.filterButtonActive]}
                onPress={() => setFilter('draft')}
              >
                <Text style={[styles.filterButtonText, filter === 'draft' && styles.filterButtonTextActive]}>
                  Drafts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'published' && styles.filterButtonActive]}
                onPress={() => setFilter('published')}
              >
                <Text style={[styles.filterButtonText, filter === 'published' && styles.filterButtonTextActive]}>
                  Published
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'ai_generated' && styles.filterButtonActive]}
                onPress={() => setFilter('ai_generated')}
              >
                <Text style={[styles.filterButtonText, filter === 'ai_generated' && styles.filterButtonTextActive]}>
                  AI Generated
                </Text>
              </TouchableOpacity>
            </View>
            
            {renderMealPlansStats()}
            <View style={styles.plansContainer}>
              {filteredPlans.map(renderMealPlan)}
            </View>
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* Modals */}
      <CreateMealPlanModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async () => {
          try {
            await fetchMealPlans();
            setShowCreateModal(false);
          } catch (error) {
            console.error('Error refreshing meal plans:', error);
          }
        }}
      />

      <MealPlanDetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        plan={{ mealPlan: selectedPlan }}
        onChoose={handleChoosePlan}
        onAssign={handleAssignPlan}
        onDelete={() => {
          if (selectedPlan) {
            handleDeletePlan(selectedPlan.id, selectedPlan.title);
          }
        }}
        onUpdate={fetchMealPlans}
      />

      <ApplyMealPlanModal
        visible={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        mealPlan={selectedPlan}
        onSuccess={() => {
          setShowApplyModal(false);
          fetchMealPlans();
        }}
      />

      <AssignMealPlanModal
        visible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        mealPlanId={selectedPlan?.id || ''}
        mealPlanName={selectedPlan?.title || ''}
        onAssignSuccess={() => {
          setShowAssignModal(false);
          fetchMealPlans();
        }}
      />
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
  createButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  plansStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  planStatCard: {
    alignItems: 'center',
  },
  planStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  planStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  planStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // New styles for AI-generated plans and filters
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  publishButton: {
    backgroundColor: '#E8F5E8',
  },
  applyButton: {
    backgroundColor: '#FFF3E0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterButtonActive: {
    backgroundColor: '#A78BFA',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
});