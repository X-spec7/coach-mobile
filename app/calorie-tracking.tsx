import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  getCalorieGoals,
  getDailyLogs,
  CalorieGoal,
  DailyLog,
  MealType,
  FoodEntry,
} from './services/calorieTrackingService';
import { MealTrackingService, ScheduledMeal, ScheduledMealDetails } from './services/mealTrackingService';

const { width } = Dimensions.get('window');

export default function CalorieTrackingScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [goals, setGoals] = useState<CalorieGoal | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduledMeals, setScheduledMeals] = useState<ScheduledMeal[]>([]);
  const [scheduledMealDetails, setScheduledMealDetails] = useState<ScheduledMealDetails[]>([]);
  const [scheduledNutrition, setScheduledNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'background');

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus (e.g., after marking a meal as completed)
  useFocusEffect(
    useCallback(() => {
      console.log('Calorie tracking screen focused - refreshing data...');
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Starting to load calorie tracking data...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const dataPromise = (async () => {
        console.log('Fetching calorie goals...');
        const goalsResponse = await getCalorieGoals();
        console.log('Goals response:', goalsResponse);
        
        console.log('Fetching daily logs...');
        const logsResponse = await getDailyLogs({ date: formatDate(selectedDate) });
        console.log('Logs response:', logsResponse);

        // Fetch scheduled meals in parallel
        console.log('Fetching scheduled meals...');
        await fetchScheduledMeals(formatDate(selectedDate));

        return { goalsResponse, logsResponse };
      })();

      const { goalsResponse, logsResponse } = await Promise.race([dataPromise, timeoutPromise]) as any;

      setGoals(goalsResponse.goal);
      setTodayLog(logsResponse.logs[0] || null);
      console.log('Data loaded successfully');
      
      // If no goals are set, show a message
      if (!goalsResponse.goal) {
        console.log('No calorie goals found - user may need to set them up');
      }
    } catch (error) {
      console.error('Error loading calorie tracking data:', error);
      Alert.alert('Error', `Failed to load calorie tracking data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (timeString: string): string => {
    try {
      // Handle different time formats
      if (timeString.includes('T')) {
        // Full datetime string
        return new Date(timeString).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (timeString.includes(':')) {
        // Time only string (HH:MM:SS or HH:MM)
        const timeParts = timeString.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else {
        // Fallback - return the original string
        return timeString;
      }
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return timeString; // Return original string if parsing fails
    }
  };

  const fetchScheduledMeals = async (date: string) => {
    try {
      console.log('Fetching scheduled meals for date:', date);
      const response = await MealTrackingService.getScheduledMeals({
        date_from: date,
        date_to: date,
      });
      
      console.log('Scheduled meals response:', response);
      setScheduledMeals(response.scheduled_meals);
      
      // Fetch details for each scheduled meal to get nutrition info
      const mealDetailsPromises = response.scheduled_meals.map(meal => 
        MealTrackingService.getScheduledMealDetails(meal.id)
      );
      
      const mealDetails = await Promise.all(mealDetailsPromises);
      console.log('Scheduled meal details:', mealDetails);
      
      setScheduledMealDetails(mealDetails.map(detail => detail.scheduled_meal));
      
      // Calculate total nutrition from scheduled meals
      // For completed meals, use planned nutrition; for incomplete meals, use consumed nutrition
      const totalNutrition = mealDetails.reduce((total, detail) => {
        const meal = detail.scheduled_meal;
        
        // If meal is completed, use planned nutrition; otherwise use consumed nutrition
        const nutritionToUse = meal.is_completed ? meal.planned_nutrition : meal.consumed_nutrition;
        const caloriesToUse = meal.is_completed ? 
          (meal.planned_nutrition.calories || 0) : 
          meal.consumed_calories;
        
        return {
          calories: total.calories + caloriesToUse,
          protein: total.protein + nutritionToUse.protein,
          carbs: total.carbs + nutritionToUse.carbs,
          fat: total.fat + nutritionToUse.fat,
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      console.log('Total scheduled nutrition:', totalNutrition);
      console.log('Scheduled meals completion status:', mealDetails.map(detail => ({
        meal: detail.scheduled_meal.meal_time_name,
        is_completed: detail.scheduled_meal.is_completed,
        consumed_calories: detail.scheduled_meal.consumed_calories,
        planned_calories: detail.scheduled_meal.planned_nutrition.calories,
        used_calories: detail.scheduled_meal.is_completed ? 
          (detail.scheduled_meal.planned_nutrition.calories || 0) : 
          detail.scheduled_meal.consumed_calories
      })));
      setScheduledNutrition(totalNutrition);
      
    } catch (error) {
      console.error('Error fetching scheduled meals:', error);
      // Don't show error alert for scheduled meals as they're optional
      setScheduledMeals([]);
      setScheduledMealDetails([]);
      setScheduledNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 75) return '#FF9800';
    return '#F44336';
  };

  // Calculate total calories including both manual logs and scheduled meals
  const getTotalCalories = (): number => {
    const manualCalories = todayLog?.total_calories || 0;
    const scheduledCalories = scheduledNutrition.calories;
    return manualCalories + scheduledCalories;
  };

  // Calculate total protein including both manual logs and scheduled meals
  const getTotalProtein = (): number => {
    const manualProtein = todayLog?.total_protein || 0;
    const scheduledProtein = scheduledNutrition.protein;
    return manualProtein + scheduledProtein;
  };

  // Calculate total carbs including both manual logs and scheduled meals
  const getTotalCarbs = (): number => {
    const manualCarbs = todayLog?.total_carbs || 0;
    const scheduledCarbs = scheduledNutrition.carbs;
    return manualCarbs + scheduledCarbs;
  };

  // Calculate total fat including both manual logs and scheduled meals
  const getTotalFat = (): number => {
    const manualFat = todayLog?.total_fat || 0;
    const scheduledFat = scheduledNutrition.fat;
    return manualFat + scheduledFat;
  };

  const handleMealPress = (meal: ScheduledMeal) => {
    // Navigate to meal detail/tracking page
    router.push({
      pathname: '/meal-detail',
      params: { mealId: meal.id }
    });
  };

  const handleMarkCompleted = async (meal: ScheduledMeal) => {
    try {
      // For now, just navigate to meal detail page where user can mark as completed
      // In the future, we could add a direct API call to mark as completed
      router.push({
        pathname: '/meal-detail',
        params: { mealId: meal.id }
      });
    } catch (error) {
      console.error('Error handling meal completion:', error);
      Alert.alert('Error', 'Failed to update meal status');
    }
  };

  const getMealTypeIcon = (mealType: MealType): string => {
    switch (mealType) {
      case 'breakfast':
        return 'sunny';
      case 'lunch':
        return 'restaurant';
      case 'dinner':
        return 'moon';
      case 'snack':
        return 'cafe';
      default:
        return 'nutrition';
    }
  };

  const getMealTypeColor = (mealType: MealType): string => {
    switch (mealType) {
      case 'breakfast':
        return '#FF9800';
      case 'lunch':
        return '#4CAF50';
      case 'dinner':
        return '#2196F3';
      case 'snack':
        return '#9C27B0';
      default:
        return '#607D8B';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} translucent={false} />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} translucent={false} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={styles.title}>Calorie Tracking</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/calorie-goals')}
        >
          <Ionicons name="settings-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Daily Progress Card */}
        <ThemedView style={[styles.progressCard, { backgroundColor: cardBackground }]}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressTitle}>Today's Progress</ThemedText>
            <ThemedText style={styles.dateText}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </ThemedText>
          </View>

          {goals ? (
            <>
              {/* Calories Progress */}
              <View style={styles.calorieProgress}>
                <View style={styles.calorieInfo}>
                  <ThemedText style={styles.calorieNumber}>
                    {getTotalCalories()}
                  </ThemedText>
                  <ThemedText style={styles.calorieLabel}>calories</ThemedText>
                  <ThemedText style={styles.calorieGoal}>
                    / {goals.daily_calories} goal
                  </ThemedText>
                </View>
                <View style={styles.progressRing}>
                  <View
                    style={[
                      styles.progressCircle,
                      {
                        borderColor: getProgressColor(
                          (getTotalCalories() / goals.daily_calories) * 100
                        ),
                      },
                    ]}
                  >
                    <ThemedText style={styles.progressPercentage}>
                      {Math.round((getTotalCalories() / goals.daily_calories) * 100)}%
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Macronutrients */}
              <View style={styles.macrosContainer}>
                <View style={styles.macroItem}>
                  <ThemedText style={styles.macroLabel}>Protein</ThemedText>
                  <ThemedText style={styles.macroValue}>
                    {Math.round(getTotalProtein())}g
                  </ThemedText>
                  <ThemedText style={styles.macroGoal}>
                    / {goals.daily_protein}g
                  </ThemedText>
                </View>
                <View style={styles.macroItem}>
                  <ThemedText style={styles.macroLabel}>Carbs</ThemedText>
                  <ThemedText style={styles.macroValue}>
                    {Math.round(getTotalCarbs())}g
                  </ThemedText>
                  <ThemedText style={styles.macroGoal}>
                    / {goals.daily_carbs}g
                  </ThemedText>
                </View>
                <View style={styles.macroItem}>
                  <ThemedText style={styles.macroLabel}>Fat</ThemedText>
                  <ThemedText style={styles.macroValue}>
                    {Math.round(getTotalFat())}g
                  </ThemedText>
                  <ThemedText style={styles.macroGoal}>
                    / {goals.daily_fat}g
                  </ThemedText>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noGoalsContainer}>
              <ThemedText style={styles.noGoalsText}>
                No calorie goals set
              </ThemedText>
              <TouchableOpacity
                style={[styles.setGoalsButton, { backgroundColor: primaryColor }]}
                onPress={() => router.push('/calorie-goals')}
              >
                <ThemedText style={styles.setGoalsButtonText}>
                  Set Goals
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: cardBackground }]}
            onPress={() => router.push('/add-food')}
          >
            <Ionicons name="add-circle" size={28} color={primaryColor} />
            <ThemedText style={styles.quickActionText}>Add Food</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Search & log foods</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: cardBackground }]}
            onPress={() => router.push('/calorie-goals')}
          >
            <Ionicons name="flag" size={28} color={primaryColor} />
            <ThemedText style={styles.quickActionText}>Goals</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Set nutrition targets</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: cardBackground }]}
            onPress={() => router.push('/calorie-stats')}
          >
            <Ionicons name="analytics" size={28} color={primaryColor} />
            <ThemedText style={styles.quickActionText}>Stats</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>View progress</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Scheduled Meals */}
        {scheduledMeals.length > 0 && (
          <ThemedView style={[styles.scheduledMealsCard, { backgroundColor: cardBackground }]}>
            <View style={styles.scheduledMealsHeader}>
              <View style={styles.scheduledMealsTitleContainer}>
                <ThemedText style={styles.scheduledMealsTitle}>Scheduled Meals</ThemedText>
                <TouchableOpacity 
                  onPress={() => router.push('/scheduled-meals')}
                  style={styles.viewAllButton}
                >
                  <ThemedText style={styles.viewAllText}>View All</ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                </TouchableOpacity>
              </View>
              <ThemedText style={styles.scheduledMealsSubtitle}>
                {scheduledNutrition.calories} calories from meal plan
              </ThemedText>
            </View>
            <View style={styles.scheduledMealsList}>
              {scheduledMeals.map((meal) => (
                <TouchableOpacity 
                  key={meal.id} 
                  style={[
                    styles.scheduledMealItem,
                    meal.is_completed && styles.scheduledMealCompleted
                  ]}
                  onPress={() => handleMealPress(meal)}
                >
                  <View style={styles.scheduledMealInfo}>
                    <View style={styles.scheduledMealNameContainer}>
                      <ThemedText style={styles.scheduledMealName}>
                        {meal.meal_time_name}
                      </ThemedText>
                      {meal.is_completed && (
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      )}
                    </View>
                    <ThemedText style={styles.scheduledMealTime}>
                      {formatTime(meal.meal_time_time)}
                    </ThemedText>
                    <ThemedText style={styles.scheduledMealStatus}>
                      {meal.consumed_foods_count}/{meal.total_foods_count} foods consumed
                    </ThemedText>
                  </View>
                  <View style={styles.scheduledMealProgress}>
                    <ThemedText style={[
                      styles.scheduledMealPercentage,
                      meal.is_completed && styles.scheduledMealPercentageCompleted
                    ]}>
                      {meal.completion_percentage}%
                    </ThemedText>
                    <View style={styles.scheduledMealProgressBar}>
                      <View 
                        style={[
                          styles.scheduledMealProgressFill,
                          { 
                            width: `${meal.completion_percentage}%`,
                            backgroundColor: meal.is_completed ? '#4CAF50' : '#A26FFD'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>
        )}

        {/* Today's Food Entries */}
        <ThemedView style={[styles.foodEntriesCard, { backgroundColor: cardBackground }]}>
          <View style={styles.foodEntriesHeader}>
            <ThemedText style={styles.foodEntriesTitle}>Manual Food Log</ThemedText>
            <TouchableOpacity onPress={() => router.push('/add-food')}>
              <Ionicons name="add" size={24} color={primaryColor} />
            </TouchableOpacity>
          </View>

          {todayLog?.food_entries && todayLog.food_entries.length > 0 ? (
            <View style={styles.foodEntriesList}>
              {todayLog.food_entries.map((entry: FoodEntry) => (
                <View key={entry.id} style={styles.foodEntry}>
                  <View style={styles.foodEntryHeader}>
                    <View style={styles.foodEntryInfo}>
                      <ThemedText style={styles.foodName}>
                        {entry.food_item_details.name}
                      </ThemedText>
                      <View style={styles.foodDetails}>
                        <ThemedText style={styles.foodAmount}>
                          {entry.amount} {entry.unit}
                        </ThemedText>
                        <View
                          style={[
                            styles.mealTypeBadge,
                            { backgroundColor: getMealTypeColor(entry.meal_type) },
                          ]}
                        >
                          <Ionicons
                            name={getMealTypeIcon(entry.meal_type) as any}
                            size={12}
                            color="white"
                          />
                          <ThemedText style={styles.mealTypeText}>
                            {entry.meal_type}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    <View style={styles.foodEntryCalories}>
                      <ThemedText style={styles.caloriesText}>
                        {entry.calories} cal
                      </ThemedText>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push(`/edit-food-entry/${entry.id}`)}
                      >
                        <Ionicons name="pencil" size={16} color={textColor} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {entry.notes && (
                    <ThemedText style={styles.foodNotes}>{entry.notes}</ThemedText>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyFoodEntries}>
              <Ionicons name="restaurant-outline" size={48} color={textColor} />
              <ThemedText style={styles.emptyFoodText}>
                No food logged today
              </ThemedText>
              <TouchableOpacity
                style={[styles.addFirstFoodButton, { backgroundColor: primaryColor }]}
                onPress={() => router.push('/add-food')}
              >
                <ThemedText style={styles.addFirstFoodButtonText}>
                  Add Your First Food
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>

        {/* Statistics Card */}
        <ThemedView style={[styles.statsCard, { backgroundColor: cardBackground }]}>
          <View style={styles.statsHeader}>
            <ThemedText style={styles.statsTitle}>This Week</ThemedText>
            <TouchableOpacity onPress={() => router.push('/calorie-stats')}>
              <ThemedText style={[styles.viewAllText, { color: primaryColor }]}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {Math.round((todayLog?.total_calories || 0) / 7)} cal/day
              </ThemedText>
              <ThemedText style={styles.statLabel}>Average</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {todayLog?.food_entries?.length || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Foods Today</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {goals ? Math.round(((todayLog?.total_calories || 0) / goals.daily_calories) * 100) : 0}%
              </ThemedText>
              <ThemedText style={styles.statLabel}>Goal Progress</ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20, // Increased vertical padding
    paddingTop: 15, // Increased top padding to give more space for title
    minHeight: 70, // Further increased height to accommodate title
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 34, // Added line height to prevent text clipping
    paddingVertical: 4, // Added vertical padding to the text itself
  },
  settingsButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  progressCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    opacity: 0.7,
  },
  calorieProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieInfo: {
    flex: 1,
  },
  calorieNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 42, // Added line height to prevent text clipping
    paddingVertical: 2, // Added vertical padding to prevent cutoff
  },
  calorieLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  calorieGoal: {
    fontSize: 14,
    opacity: 0.5,
  },
  progressRing: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macroGoal: {
    fontSize: 12,
    opacity: 0.5,
  },
  noGoalsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noGoalsText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  setGoalsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setGoalsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    minWidth: (width - 80) / 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionSubtext: {
    marginTop: 4,
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
  scheduledMealsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scheduledMealsHeader: {
    marginBottom: 16,
  },
  scheduledMealsTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduledMealsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    marginRight: 4,
  },
  scheduledMealsSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  scheduledMealsList: {
    gap: 12,
  },
  scheduledMealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(162, 111, 253, 0.05)',
    marginBottom: 8,
  },
  scheduledMealCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  scheduledMealInfo: {
    flex: 1,
  },
  scheduledMealNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scheduledMealName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  scheduledMealTime: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  scheduledMealStatus: {
    fontSize: 12,
    opacity: 0.6,
  },
  scheduledMealProgress: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  scheduledMealPercentage: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduledMealPercentageCompleted: {
    color: '#4CAF50',
  },
  scheduledMealProgressBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scheduledMealProgressFill: {
    height: '100%',
    backgroundColor: '#A26FFD',
    borderRadius: 2,
  },
  foodEntriesCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foodEntriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  foodEntriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  foodEntriesList: {
    gap: 12,
  },
  foodEntry: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  foodEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodEntryInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  foodDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  foodAmount: {
    fontSize: 14,
    opacity: 0.7,
  },
  mealTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  mealTypeText: {
    fontSize: 10,
    color: 'white',
    textTransform: 'capitalize',
  },
  foodEntryCalories: {
    alignItems: 'flex-end',
  },
  caloriesText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  editButton: {
    padding: 4,
  },
  foodNotes: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyFoodEntries: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFoodText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  addFirstFoodButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstFoodButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
}); 