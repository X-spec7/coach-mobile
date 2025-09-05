import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  getGenerationDetails,
  Generation,
} from '../services/aiPlannerService';

export default function AIGenerationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [generation, setGeneration] = useState<Generation & { generated_plan: any } | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'background');

  useEffect(() => {
    if (id) {
      loadGenerationDetails();
    }
  }, [id]);

  const loadGenerationDetails = async () => {
    try {
      setLoading(true);
      const response = await getGenerationDetails(id);
      setGeneration(response.generation);
    } catch (error) {
      console.error('Error loading generation details:', error);
      Alert.alert('Error', 'Failed to load generation details');
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'processing': return '#FF9800';
      case 'failed': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'processing': return 'time';
      case 'failed': return 'close-circle';
      default: return 'ellipse';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0])); // First day expanded by default

  const toggleDay = (dayIndex: number) => {
    const newExpandedDays = new Set(expandedDays);
    if (newExpandedDays.has(dayIndex)) {
      newExpandedDays.delete(dayIndex);
    } else {
      newExpandedDays.add(dayIndex);
    }
    setExpandedDays(newExpandedDays);
  };

  const renderMealPlan = (plan: any) => {
    if (!plan) {
      return <ThemedText style={styles.errorText}>No meal plan data available</ThemedText>;
    }
    
    // Sort daily plans by day number
    const sortedDailyPlans = plan.daily_plans ? [...plan.daily_plans].sort((a: any, b: any) => {
      const dayA = parseInt(a.day?.replace('day', '') || '0');
      const dayB = parseInt(b.day?.replace('day', '') || '0');
      return dayA - dayB;
    }) : [];
    
    return (
      <View style={styles.planSection}>
        <View style={styles.planHeader}>
          <Ionicons name="restaurant" size={24} color={primaryColor} />
          <ThemedText style={styles.planTitle}>{plan.title || 'Meal Plan'}</ThemedText>
        </View>
        <ThemedText style={styles.planDescription}>{plan.description || ''}</ThemedText>
      
      <View style={styles.nutritionSummary}>
        <View style={styles.nutritionItem}>
          <ThemedText style={styles.nutritionValue}>{plan.total_calories || 0}</ThemedText>
          <ThemedText style={styles.nutritionLabel}>Total Calories</ThemedText>
        </View>
        <View style={styles.nutritionItem}>
          <ThemedText style={styles.nutritionValue}>{Math.round(plan.total_protein || 0)}g</ThemedText>
          <ThemedText style={styles.nutritionLabel}>Protein</ThemedText>
        </View>
        <View style={styles.nutritionItem}>
          <ThemedText style={styles.nutritionValue}>{Math.round(plan.total_carbs || 0)}g</ThemedText>
          <ThemedText style={styles.nutritionLabel}>Carbs</ThemedText>
        </View>
        <View style={styles.nutritionItem}>
          <ThemedText style={styles.nutritionValue}>{Math.round(plan.total_fat || 0)}g</ThemedText>
          <ThemedText style={styles.nutritionLabel}>Fat</ThemedText>
        </View>
      </View>

      {sortedDailyPlans.length > 0 && (
        <View style={styles.dailyPlansSection}>
          <ThemedText style={styles.sectionTitle}>Daily Plans</ThemedText>
          {sortedDailyPlans.map((dailyPlan: any, index: number) => {
            const dayNumber = parseInt(dailyPlan.day?.replace('day', '') || `${index + 1}`);
            const isExpanded = expandedDays.has(index);
            
            return (
              <View key={dailyPlan.id || index} style={styles.dailyPlanCard}>
                <TouchableOpacity 
                  style={styles.dailyPlanHeader}
                  onPress={() => toggleDay(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dailyPlanHeaderContent}>
                    <ThemedText style={styles.dailyPlanTitle}>
                      Day {dayNumber}
                    </ThemedText>
                    <ThemedText style={styles.dailyPlanCalories}>
                      {dailyPlan.total_calories || 0} calories
                    </ThemedText>
                  </View>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={textColor + '60'} 
                  />
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.dailyPlanContent}>
              
              {dailyPlan.meal_times && dailyPlan.meal_times.map((meal: any, mealIndex: number) => (
                <View key={meal.id || mealIndex} style={styles.mealTime}>
                  <ThemedText style={styles.mealTimeName}>{meal.name || 'Meal'}</ThemedText>
                  <ThemedText style={styles.mealTimeCalories}>
                    {meal.total_calories || 0} cal
                  </ThemedText>
                  
                  {meal.food_items && meal.food_items.map((food: any, foodIndex: number) => (
                    <View key={food.id || foodIndex} style={styles.foodItem}>
                      <ThemedText style={styles.foodName}>
                        {food.amount || 0}{food.unit || 'g'} {food.food_item_details?.name || 'Unknown Food'}
                      </ThemedText>
                      <ThemedText style={styles.foodCalories}>
                        {Math.round(food.calories || 0)} cal
                      </ThemedText>
                    </View>
                  ))}
                </View>
              ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
      </View>
    );
  };

  const renderWorkoutPlan = (plan: any) => (
    <View style={styles.planSection}>
      <View style={styles.planHeader}>
        <Ionicons name="fitness" size={24} color={primaryColor} />
        <ThemedText style={styles.planTitle}>{plan.title}</ThemedText>
      </View>
      <ThemedText style={styles.planDescription}>{plan.description}</ThemedText>
      
      <View style={styles.workoutSummary}>
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryValue}>{plan.category?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</ThemedText>
          <ThemedText style={styles.summaryLabel}>Category</ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryValue}>{plan.total_calories}</ThemedText>
          <ThemedText style={styles.summaryLabel}>Total Calories</ThemedText>
        </View>
      </View>

      {plan.daily_plans && plan.daily_plans.length > 0 && (
        <View style={styles.dailyPlansSection}>
          <ThemedText style={styles.sectionTitle}>Daily Plans</ThemedText>
          {plan.daily_plans.map((dailyPlan: any, index: number) => (
            <View key={dailyPlan.id || index} style={styles.dailyPlan}>
              <ThemedText style={styles.dailyPlanTitle}>
                {dailyPlan.day.replace('day', 'Day ')}
              </ThemedText>
              <ThemedText style={styles.dailyPlanCalories}>
                {dailyPlan.total_calories} calories
              </ThemedText>
              
              {dailyPlan.workout_exercises && dailyPlan.workout_exercises.map((exercise: any, exerciseIndex: number) => (
                <View key={exercise.id || exerciseIndex} style={styles.exercise}>
                  <ThemedText style={styles.exerciseName}>
                    {exercise.exercise.title}
                  </ThemedText>
                  <View style={styles.exerciseDetails}>
                    <ThemedText style={styles.exerciseDetail}>
                      {exercise.set_count} sets × {exercise.reps_count} reps
                    </ThemedText>
                    <ThemedText style={styles.exerciseDetail}>
                      Rest: {exercise.rest_duration}s
                    </ThemedText>
                    <ThemedText style={styles.exerciseDetail}>
                      {exercise.calorie} cal
                    </ThemedText>
                  </View>
                  {exercise.notes && (
                    <ThemedText style={styles.exerciseNotes}>{exercise.notes}</ThemedText>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!generation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Generation not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Add safety check for generation properties
  const safeGeneration = {
    ...generation,
    cost: typeof generation.cost === 'string' ? parseFloat(generation.cost) : (generation.cost || 0),
    tokens_used: generation.tokens_used || 0,
    processing_time: generation.processing_time || 0,
    status: generation.status || 'unknown',
    generation_type: generation.generation_type || 'unknown',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={styles.title}>Generation Details</ThemedText>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Generation Info */}
        <ThemedView style={[styles.infoCard, { backgroundColor: cardBackground }]}>
          <View style={styles.generationHeader}>
            <View style={styles.generationType}>
              <Ionicons
                name={generation.generation_type === 'meal_plan' ? 'restaurant' : 'fitness'}
                size={20}
                color={primaryColor}
              />
              <ThemedText style={styles.generationTypeText}>
                {generation.generation_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </ThemedText>
            </View>
            <View style={styles.generationStatus}>
              <Ionicons
                name={getStatusIcon(generation.status)}
                size={16}
                color={getStatusColor(generation.status)}
              />
              <ThemedText
                style={[
                  styles.statusText,
                  { color: getStatusColor(generation.status) },
                ]}
              >
                {generation.status.charAt(0).toUpperCase() + generation.status.slice(1)}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.promptText}>{generation.generation_type === 'meal_plan' ? 'Meal Plan' : 'Workout Plan'} - {generation.status}</ThemedText>

          <View style={styles.generationStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={textColor + '60'} />
              <ThemedText style={styles.statText}>
                {formatDate(generation.created_at)}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flash-outline" size={16} color={textColor + '60'} />
              <ThemedText style={styles.statText}>
                {safeGeneration.tokens_used} tokens
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={16} color={textColor + '60'} />
              <ThemedText style={styles.statText}>
                ${safeGeneration.cost.toFixed(4)}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="speedometer-outline" size={16} color={textColor + '60'} />
              <ThemedText style={styles.statText}>
                {safeGeneration.processing_time}s
              </ThemedText>
            </View>
          </View>
        </ThemedView>


        {/* Generated Plan */}
        {generation.generated_plan && (
          <ThemedView style={[styles.planCard, { backgroundColor: cardBackground }]}>
            {generation.generation_type === 'meal_plan'
              ? renderMealPlan(generation.generated_plan)
              : renderWorkoutPlan(generation.generated_plan)}
          </ThemedView>
        )}

        {/* Actions */}
        {generation.status === 'completed' && generation.generated_plan && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={() => {
                if (generation.generation_type === 'meal_plan') {
                  // Navigate to meal plans page to edit the AI-generated plan
                  router.push('/my-meal-plans' as any);
                } else {
                  // For workout plans, navigate to workout plans page
                  router.push('/my-workouts' as any);
                }
              }}
            >
              <Ionicons name="create-outline" size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>
                {generation.generation_type === 'meal_plan' ? 'Edit Meal Plan' : 'Edit Workout Plan'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerRight: {
    minWidth: 40,
  },
  scrollView: {
    flex: 1,
    paddingTop: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    opacity: 0.7,
  },
  infoCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  generationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  generationType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generationTypeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  generationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  promptText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  generationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    opacity: 0.7,
  },
  modificationsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modificationsInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 16,
  },
  regenerateActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  regenerateActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  planCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planSection: {
    gap: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  nutritionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  workoutSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  dailyPlansSection: {
    gap: 16,
  },
  dailyPlan: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    gap: 12,
  },
  dailyPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dailyPlanCalories: {
    fontSize: 14,
    opacity: 0.7,
  },
  mealTime: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    gap: 8,
  },
  mealTimeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  mealTimeCalories: {
    fontSize: 12,
    opacity: 0.7,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  foodName: {
    fontSize: 12,
    flex: 1,
  },
  foodCalories: {
    fontSize: 12,
    opacity: 0.7,
  },
  exercise: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    gap: 8,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseDetail: {
    fontSize: 12,
    opacity: 0.7,
  },
  exerciseNotes: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  dailyPlanCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dailyPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dailyPlanHeaderContent: {
    flex: 1,
  },
  dailyPlanContent: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});