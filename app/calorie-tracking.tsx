import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
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

const { width } = Dimensions.get('window');

export default function CalorieTrackingScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [goals, setGoals] = useState<CalorieGoal | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'background');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsResponse, logsResponse] = await Promise.all([
        getCalorieGoals(),
        getDailyLogs({ date: formatDate(selectedDate) }),
      ]);

      setGoals(goalsResponse.goal);
      setTodayLog(logsResponse.logs[0] || null);
    } catch (error) {
      console.error('Error loading calorie tracking data:', error);
      Alert.alert('Error', 'Failed to load calorie tracking data');
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
    return new Date(timeString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 75) return '#FF9800';
    return '#F44336';
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
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

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
                    {todayLog?.total_calories || 0}
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
                          ((todayLog?.total_calories || 0) / goals.daily_calories) * 100
                        ),
                      },
                    ]}
                  >
                    <ThemedText style={styles.progressPercentage}>
                      {Math.round(((todayLog?.total_calories || 0) / goals.daily_calories) * 100)}%
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Macronutrients */}
              <View style={styles.macrosContainer}>
                <View style={styles.macroItem}>
                  <ThemedText style={styles.macroLabel}>Protein</ThemedText>
                  <ThemedText style={styles.macroValue}>
                    {todayLog?.total_protein || 0}g
                  </ThemedText>
                  <ThemedText style={styles.macroGoal}>
                    / {goals.daily_protein}g
                  </ThemedText>
                </View>
                <View style={styles.macroItem}>
                  <ThemedText style={styles.macroLabel}>Carbs</ThemedText>
                  <ThemedText style={styles.macroValue}>
                    {todayLog?.total_carbs || 0}g
                  </ThemedText>
                  <ThemedText style={styles.macroGoal}>
                    / {goals.daily_carbs}g
                  </ThemedText>
                </View>
                <View style={styles.macroItem}>
                  <ThemedText style={styles.macroLabel}>Fat</ThemedText>
                  <ThemedText style={styles.macroValue}>
                    {todayLog?.total_fat || 0}g
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

        {/* Today's Food Entries */}
        <ThemedView style={[styles.foodEntriesCard, { backgroundColor: cardBackground }]}>
          <View style={styles.foodEntriesHeader}>
            <ThemedText style={styles.foodEntriesTitle}>Today's Food</ThemedText>
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
    paddingVertical: 16,
    paddingTop: 20,
    minHeight: 56, // Ensure consistent header height
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
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
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