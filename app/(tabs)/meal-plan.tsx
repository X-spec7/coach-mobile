import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MealService, MealPlan, MealPlanGoal } from '../services/mealService';
import { CreateMealPlanModal } from '../modals/CreateMealPlanModal';
import { MealPlanDetailsModal } from '../modals/MealPlanDetailsModal';
import { ApplyMealPlanModal } from '../modals/ApplyMealPlanModal';
import AssignMealPlanModal from '../modals/AssignMealPlanModal';
import { useAuth } from '../contexts/AuthContext';

// Meal plan categories based on goals
const mealPlanCategories = [
  {
    id: 'weight_loss',
    title: 'Weight Loss',
    description: 'Calorie deficit plans for fat reduction',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500',
  },
  {
    id: 'weight_gain',
    title: 'Weight Gain',
    description: 'Calorie surplus plans for healthy weight gain',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500',
  },
  {
    id: 'muscle_gain',
    title: 'Muscle Gain',
    description: 'High protein plans for muscle building',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    description: 'Balanced plans to maintain current weight',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500',
  },
  {
    id: 'athletic_performance',
    title: 'Athletic Performance',
    description: 'Optimized nutrition for sports and performance',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  {
    id: 'general_health',
    title: 'General Health',
    description: 'Well-balanced plans for overall wellness',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500',
  },
  {
    id: 'others',
    title: 'Others',
    description: 'Meal plans with unique or specialized goals',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500',
  },
];

export default function MealPlanScreen() {
  console.log('MealPlanScreen rendering...');
  
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchMealPlans();
    fetchCategoryCounts();
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
      
      // Don't show alert for authentication required errors - user might not be logged in yet
      if (errorMessage.includes('Authentication required')) {
        console.log('User not authenticated, skipping meal plans fetch');
        setMealPlans([]); // Clear any existing plans
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategoryCounts = async () => {
    try {
      const counts: Record<string, number> = {};
      
      // Fetch counts for each category
      for (const category of mealPlanCategories) {
        if (category.id === 'others') {
          // For "others", we'll fetch all plans and count those not in predefined categories
          const allPlansResponse = await MealService.getPublicMealPlans({ limit: 1000 });
          const predefinedGoals = ['weight_loss', 'weight_gain', 'muscle_gain', 'maintenance', 'athletic_performance', 'general_health'];
          const otherPlans = allPlansResponse.meal_plans.filter(plan => 
            !predefinedGoals.includes(plan.goal)
          );
          counts[category.id] = otherPlans.length;
        } else {
          const response = await MealService.getPublicMealPlans({ 
            goal: category.id as MealPlanGoal,
            limit: 1 // We only need the count
          });
          counts[category.id] = response.total;
        }
      }
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
      // Don't show error alert for category counts as they're not critical
    }
  };

  const handleRefresh = () => {
    fetchMealPlans(true);
  };

  const handlePlanPress = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  };

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
            <Text style={styles.planTitle}>{plan.title}</Text>
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
                {plan.daily_plans_count || 0} days
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {plan.total_calories} cal
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="nutrition-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                P: {plan.total_protein}g
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="leaf-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                C: {plan.total_carbs}g
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                F: {plan.total_fat}g
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryCard = (category: typeof mealPlanCategories[0]) => {
    const count = categoryCounts[category.id] || 0;
    
    return (
      <TouchableOpacity 
        key={category.id} 
        style={styles.categoryCard}
        onPress={() => router.push(`/meal-plan-categories?category=${category.id}`)}
      >
        <Image source={{ uri: category.image }} style={styles.categoryImage} />
        <View style={styles.categoryOverlay}>
          <View style={styles.categoryContent}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <View style={styles.categoryCount}>
                <Text style={styles.categoryCountText}>{count}</Text>
              </View>
            </View>
            <Text style={styles.categoryDescription}>{category.description}</Text>
            <View style={styles.categoryAction}>
              <Text style={styles.categoryActionText}>Explore</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyMealPlans = () => (
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
        <Text style={styles.title}>Meal Plans</Text>
        
        {/* My Meal Plans Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Meal Plans</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#A78BFA" />
              <Text style={styles.addButtonText}>Create Plan</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text style={styles.loadingText}>Loading meal plans...</Text>
            </View>
          ) : mealPlans.length > 0 ? (
            <>
              <View style={styles.plansContainer}>
                {mealPlans.slice(0, 3).map(renderMealPlan)}
              </View>
              {mealPlans.length > 3 && (
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => router.push('/my-meal-plans')}
                >
                  <Text style={styles.viewMoreText}>View All {mealPlans.length} Plans</Text>
                  <Ionicons name="chevron-forward" size={16} color="#A78BFA" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            renderEmptyMealPlans()
              )}
            </View>

        {/* Meal Plan Categories */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meal Plan Categories</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/meal-plan-categories')}
            >
              <Text style={styles.viewAllText}>View All Categories</Text>
              <Ionicons name="chevron-forward" size={16} color="#A78BFA" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesContainer}>
            {mealPlanCategories.map(renderCategoryCard)}
          </View>
        </View>
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
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 20,
    marginTop: 40,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#A78BFA',
    marginLeft: 4,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewAllText: {
    color: '#A78BFA',
    marginRight: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
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
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewMoreText: {
    color: '#A78BFA',
    fontWeight: '600',
    marginRight: 4,
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
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  categoryImage: {
    width: '100%',
    height: 160,
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 16,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  categoryCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  categoryCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 12,
  },
  categoryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryActionText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 4,
  },
});
