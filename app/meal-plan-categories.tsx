import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { MealService, PublicMealPlan, MealPlanGoal } from './services/mealService';

// All available meal plan goals
const MEAL_PLAN_GOALS = [
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

export default function MealPlanCategoriesScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [selectedGoal, setSelectedGoal] = useState<MealPlanGoal | 'others' | null>(category as MealPlanGoal | 'others' || null);
  const [mealPlans, setMealPlans] = useState<PublicMealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedGoal) {
      fetchMealPlansByGoal();
    } else {
      fetchCategoryCounts();
    }
  }, [selectedGoal]);

  const fetchMealPlansByGoal = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      if (selectedGoal === 'others') {
        // For "others", fetch all plans and filter out predefined categories
        const allPlansResponse = await MealService.getPublicMealPlans({
          limit: 1000,
          offset: 0,
        });
        const predefinedGoals = ['weight_loss', 'weight_gain', 'muscle_gain', 'maintenance', 'athletic_performance', 'general_health'];
        const otherPlans = allPlansResponse.meal_plans.filter(plan => 
          !predefinedGoals.includes(plan.goal)
        );
        setMealPlans(otherPlans);
      } else {
        const response = await MealService.getPublicMealPlans({
          goal: selectedGoal!,
          limit: 20,
          offset: 0,
        });
        setMealPlans(response.meal_plans);
      }
    } catch (error) {
      console.error('Error fetching meal plans by goal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load meal plans';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('User not authenticated, skipping fetch');
        setMealPlans([]);
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
      for (const goal of MEAL_PLAN_GOALS) {
        if (goal.id === 'others') {
          // For "others", fetch all plans and count those not in predefined categories
          const allPlansResponse = await MealService.getPublicMealPlans({ limit: 1000 });
          const predefinedGoals = ['weight_loss', 'weight_gain', 'muscle_gain', 'maintenance', 'athletic_performance', 'general_health'];
          const otherPlans = allPlansResponse.meal_plans.filter(plan => 
            !predefinedGoals.includes(plan.goal)
          );
          counts[goal.id] = otherPlans.length;
        } else {
          const response = await MealService.getPublicMealPlans({ 
            goal: goal.id as MealPlanGoal,
            limit: 1 // We only need the count
          });
          counts[goal.id] = response.total;
        }
      }
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
      // Don't show error alert for category counts as they're not critical
    }
  };

  const handleRefresh = () => {
    if (selectedGoal) {
      fetchMealPlansByGoal(true);
    }
  };

  const handleGoalSelect = (goalId: MealPlanGoal | 'others') => {
    setSelectedGoal(goalId);
  };

  const handleMealPlanPress = (mealPlan: PublicMealPlan) => {
    // For now, we'll show the meal plan details in a modal
    // TODO: Create a dedicated public meal plan details page
    Alert.alert(
      'Meal Plan Details',
      `${mealPlan.title}\n\n${mealPlan.description || 'No description available'}\n\nCalories: ${mealPlan.total_calories}\nProtein: ${mealPlan.total_protein}g\nCarbs: ${mealPlan.total_carbs}g\nFat: ${mealPlan.total_fat}g\n\nDays: ${mealPlan.daily_plans_count || 0}\nUsers: ${mealPlan.applications_count || 0}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Apply Plan', onPress: () => {
          // TODO: Implement apply meal plan functionality
          Alert.alert('Coming Soon', 'Apply meal plan functionality will be available soon!');
        }}
      ]
    );
  };

  const renderGoalCard = (goalItem: typeof MEAL_PLAN_GOALS[0]) => {
    const count = categoryCounts[goalItem.id] || 0;
    
    return (
      <TouchableOpacity 
        key={goalItem.id} 
        style={[
          styles.goalCard,
          selectedGoal === goalItem.id && styles.selectedGoalCard
        ]}
        onPress={() => handleGoalSelect(goalItem.id as MealPlanGoal | 'others')}
      >
        <Image source={{ uri: goalItem.image }} style={styles.goalImage} />
        <View style={styles.goalOverlay}>
          <View style={styles.goalContent}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goalItem.title}</Text>
              <View style={styles.goalCount}>
                <Text style={styles.goalCountText}>{count}</Text>
              </View>
            </View>
            <Text style={styles.goalDescription}>{goalItem.description}</Text>
            {selectedGoal === goalItem.id && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMealPlanCard = (mealPlan: PublicMealPlan) => (
    <TouchableOpacity
      key={mealPlan.id}
      style={styles.mealPlanCard}
      onPress={() => handleMealPlanPress(mealPlan)}
    >
      <View style={styles.mealPlanContent}>
        <View style={styles.mealPlanInfo}>
          <Text style={styles.mealPlanTitle}>{mealPlan.title}</Text>
          {mealPlan.description && (
            <Text style={styles.mealPlanDescription} numberOfLines={2}>
              {mealPlan.description}
            </Text>
          )}
          <View style={styles.mealPlanStats}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {mealPlan.daily_plans_count || 0} days
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {mealPlan.total_calories} cal
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="nutrition-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                P: {mealPlan.total_protein}g
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {mealPlan.applications_count || 0} users
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.mealPlanAction}>
          <Ionicons name="chevron-forward" size={20} color="#A78BFA" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Meal Plans Found</Text>
      <Text style={styles.emptySubtitle}>
        No meal plans available for this goal yet. Check back later!
      </Text>
    </View>
  );

  const getSelectedGoalTitle = () => {
    const goal = MEAL_PLAN_GOALS.find(g => g.id === selectedGoal);
    return goal ? goal.title : 'All Goals';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedGoal ? getSelectedGoalTitle() : 'Meal Plan Goals'}
        </Text>
        {selectedGoal && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSelectedGoal(null)}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        )}
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
        {selectedGoal ? (
          // Show meal plans for selected goal
          <View style={styles.mealPlansContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A78BFA" />
                <Text style={styles.loadingText}>Loading meal plans...</Text>
              </View>
            ) : mealPlans.length > 0 ? (
              <View style={styles.mealPlansList}>
                {mealPlans.map(renderMealPlanCard)}
              </View>
            ) : (
              renderEmptyState()
            )}
          </View>
        ) : (
          // Show all goals
          <View style={styles.goalsContainer}>
            <Text style={styles.sectionTitle}>Choose a Goal</Text>
            <View style={styles.goalsGrid}>
              {MEAL_PLAN_GOALS.map(renderGoalCard)}
            </View>
          </View>
        )}
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
  clearButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  goalsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  goalsGrid: {
    gap: 12,
  },
  goalCard: {
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
  },
  selectedGoalCard: {
    borderColor: '#A78BFA',
    borderWidth: 2,
  },
  goalImage: {
    width: '100%',
    height: 120,
  },
  goalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  goalContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  goalCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  goalCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalDescription: {
    fontSize: 12,
    color: '#fff',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  mealPlansContainer: {
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
  mealPlansList: {
    gap: 12,
  },
  mealPlanCard: {
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
  mealPlanContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealPlanInfo: {
    flex: 1,
  },
  mealPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  mealPlanDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  mealPlanStats: {
    flexDirection: 'row',
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
  mealPlanAction: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 