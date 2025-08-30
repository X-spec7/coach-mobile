import React, { useState, useEffect } from 'react';
import {
  View,
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
import { getCalorieStats, CalorieStats } from './services/calorieTrackingService';

const { width } = Dimensions.get('window');

export default function CalorieStatsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<CalorieStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'background');

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      if (selectedPeriod === 'day') {
        startDate.setDate(endDate.getDate());
      } else if (selectedPeriod === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else {
        startDate.setDate(endDate.getDate() - 30);
      }

      const response = await getCalorieStats({
        date_from: startDate.toISOString().split('T')[0],
        date_to: endDate.toISOString().split('T')[0],
      });
      
      console.log('Calorie stats API response:', response);
      
      // Check if response has the expected structure
      if (response && response.stats) {
        console.log('Stats data:', response.stats);
        setStats(response.stats);
      } else {
        console.warn('Unexpected API response structure:', response);
        setStats(null);
      }
    } catch (error) {
      console.error('Error loading calorie stats:', error);
      Alert.alert('Error', 'Failed to load calorie statistics. Please try again.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const getAdherenceColor = (percentage: number): string => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 75) return '#FF9800';
    return '#F44336';
  };

  const getAdherenceIcon = (percentage: number): string => {
    if (percentage >= 90) return 'checkmark-circle';
    if (percentage >= 75) return 'warning';
    return 'close-circle';
  };

  const formatDateRange = (): string => {
    if (!stats) return '';
    
    const startDate = new Date(stats.date_from);
    const endDate = new Date(stats.date_to);
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
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
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText style={styles.title}>Calorie Statistics</ThemedText>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelectorContainer}>
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                {
                  backgroundColor: selectedPeriod === 'day' ? primaryColor : cardBackground,
                },
              ]}
              onPress={() => setSelectedPeriod('day')}
            >
              <ThemedText
                style={[
                  styles.periodButtonText,
                  { color: selectedPeriod === 'day' ? 'white' : textColor },
                ]}
              >
                Day
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                {
                  backgroundColor: selectedPeriod === 'week' ? primaryColor : cardBackground,
                },
              ]}
              onPress={() => setSelectedPeriod('week')}
            >
              <ThemedText
                style={[
                  styles.periodButtonText,
                  { color: selectedPeriod === 'week' ? 'white' : textColor },
                ]}
              >
                Week
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                {
                  backgroundColor: selectedPeriod === 'month' ? primaryColor : cardBackground,
                },
              ]}
              onPress={() => setSelectedPeriod('month')}
            >
              <ThemedText
                style={[
                  styles.periodButtonText,
                  { color: selectedPeriod === 'month' ? 'white' : textColor },
                ]}
              >
                Month
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {stats && (
          <>
            {/* Date Range */}
            <ThemedView style={[styles.dateRangeCard, { backgroundColor: cardBackground }]}>
              <ThemedText style={styles.dateRangeText}>{formatDateRange()}</ThemedText>
              <ThemedText style={styles.dateRangeSubtext}>
                {stats.total_days} days of data
              </ThemedText>
            </ThemedView>

            {/* Overview Stats */}
            <ThemedView style={[styles.overviewCard, { backgroundColor: cardBackground }]}>
              <ThemedText style={styles.sectionTitle}>Overview</ThemedText>
              <View style={styles.overviewGrid}>
                <View style={styles.overviewItem}>
                  <ThemedText style={styles.overviewValue}>
                    {Math.round(stats.average_calories_per_day)}
                  </ThemedText>
                  <ThemedText style={styles.overviewLabel}>Avg Calories/Day</ThemedText>
                </View>
                <View style={styles.overviewItem}>
                  <ThemedText style={styles.overviewValue}>
                    {Math.round(stats.average_protein_per_day)}g
                  </ThemedText>
                  <ThemedText style={styles.overviewLabel}>Avg Protein/Day</ThemedText>
                </View>
                <View style={styles.overviewItem}>
                  <ThemedText style={styles.overviewValue}>
                    {Math.round(stats.average_carbs_per_day)}g
                  </ThemedText>
                  <ThemedText style={styles.overviewLabel}>Avg Carbs/Day</ThemedText>
                </View>
                <View style={styles.overviewItem}>
                  <ThemedText style={styles.overviewValue}>
                    {Math.round(stats.average_fat_per_day)}g
                  </ThemedText>
                  <ThemedText style={styles.overviewLabel}>Avg Fat/Day</ThemedText>
                </View>
              </View>
            </ThemedView>

            {/* Goal Adherence */}
            {stats.goal_adherence ? (
              <ThemedView style={[styles.adherenceCard, { backgroundColor: cardBackground }]}>
                <ThemedText style={styles.sectionTitle}>Goal Adherence</ThemedText>
                
                <View style={styles.adherenceItems}>
                  {stats.goal_adherence.calories && (
                    <View style={styles.adherenceItem}>
                      <View style={styles.adherenceHeader}>
                        <ThemedText style={styles.adherenceLabel}>Calories</ThemedText>
                        <Ionicons
                          name={getAdherenceIcon(stats.goal_adherence.calories.adherence_percentage) as any}
                          size={20}
                          color={getAdherenceColor(stats.goal_adherence.calories.adherence_percentage)}
                        />
                      </View>
                      <View style={styles.adherenceProgress}>
                        <View style={styles.adherenceBar}>
                          <View
                            style={[
                              styles.adherenceFill,
                              {
                                width: `${Math.min(stats.goal_adherence.calories.adherence_percentage, 100)}%`,
                                backgroundColor: getAdherenceColor(stats.goal_adherence.calories.adherence_percentage),
                              },
                            ]}
                          />
                        </View>
                        <ThemedText style={styles.adherencePercentage}>
                          {Math.round(stats.goal_adherence.calories.adherence_percentage)}%
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.adherenceDetails}>
                        {Math.round(stats.goal_adherence.calories.average_consumed)} / {stats.goal_adherence.calories.goal} cal
                      </ThemedText>
                    </View>
                  )}

                  {stats.goal_adherence.protein && (
                    <View style={styles.adherenceItem}>
                      <View style={styles.adherenceHeader}>
                        <ThemedText style={styles.adherenceLabel}>Protein</ThemedText>
                        <Ionicons
                          name={getAdherenceIcon(stats.goal_adherence.protein.adherence_percentage) as any}
                          size={20}
                          color={getAdherenceColor(stats.goal_adherence.protein.adherence_percentage)}
                        />
                      </View>
                      <View style={styles.adherenceProgress}>
                        <View style={styles.adherenceBar}>
                          <View
                            style={[
                              styles.adherenceFill,
                              {
                                width: `${Math.min(stats.goal_adherence.protein.adherence_percentage, 100)}%`,
                                backgroundColor: getAdherenceColor(stats.goal_adherence.protein.adherence_percentage),
                              },
                            ]}
                          />
                        </View>
                        <ThemedText style={styles.adherencePercentage}>
                          {Math.round(stats.goal_adherence.protein.adherence_percentage)}%
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.adherenceDetails}>
                        {Math.round(stats.goal_adherence.protein.average_consumed)} / {stats.goal_adherence.protein.goal}g
                      </ThemedText>
                    </View>
                  )}

                  {stats.goal_adherence.carbs && (
                    <View style={styles.adherenceItem}>
                      <View style={styles.adherenceHeader}>
                        <ThemedText style={styles.adherenceLabel}>Carbs</ThemedText>
                        <Ionicons
                          name={getAdherenceIcon(stats.goal_adherence.carbs.adherence_percentage) as any}
                          size={20}
                          color={getAdherenceColor(stats.goal_adherence.carbs.adherence_percentage)}
                        />
                      </View>
                      <View style={styles.adherenceProgress}>
                        <View style={styles.adherenceBar}>
                          <View
                            style={[
                              styles.adherenceFill,
                              {
                                width: `${Math.min(stats.goal_adherence.carbs.adherence_percentage, 100)}%`,
                                backgroundColor: getAdherenceColor(stats.goal_adherence.carbs.adherence_percentage),
                              },
                            ]}
                          />
                        </View>
                        <ThemedText style={styles.adherencePercentage}>
                          {Math.round(stats.goal_adherence.carbs.adherence_percentage)}%
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.adherenceDetails}>
                        {Math.round(stats.goal_adherence.carbs.average_consumed)} / {stats.goal_adherence.carbs.goal}g
                      </ThemedText>
                    </View>
                  )}

                  {stats.goal_adherence.fat && (
                    <View style={styles.adherenceItem}>
                      <View style={styles.adherenceHeader}>
                        <ThemedText style={styles.adherenceLabel}>Fat</ThemedText>
                        <Ionicons
                          name={getAdherenceIcon(stats.goal_adherence.fat.adherence_percentage) as any}
                          size={20}
                          color={getAdherenceColor(stats.goal_adherence.fat.adherence_percentage)}
                        />
                      </View>
                      <View style={styles.adherenceProgress}>
                        <View style={styles.adherenceBar}>
                          <View
                            style={[
                              styles.adherenceFill,
                              {
                                width: `${Math.min(stats.goal_adherence.fat.adherence_percentage, 100)}%`,
                                backgroundColor: getAdherenceColor(stats.goal_adherence.fat.adherence_percentage),
                              },
                            ]}
                          />
                        </View>
                        <ThemedText style={styles.adherencePercentage}>
                          {Math.round(stats.goal_adherence.fat.adherence_percentage)}%
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.adherenceDetails}>
                        {Math.round(stats.goal_adherence.fat.average_consumed)} / {stats.goal_adherence.fat.goal}g
                      </ThemedText>
                    </View>
                  )}
                </View>
              </ThemedView>
            ) : (
              <ThemedView style={[styles.adherenceCard, { backgroundColor: cardBackground }]}>
                <ThemedText style={styles.sectionTitle}>Goal Adherence</ThemedText>
                <View style={styles.noDataMessage}>
                  <Ionicons name="flag-outline" size={32} color={textColor + '40'} />
                  <ThemedText style={styles.noDataMessageText}>No goal data available</ThemedText>
                  <ThemedText style={styles.noDataMessageSubtext}>
                    Set calorie goals to see your adherence statistics
                  </ThemedText>
                  <TouchableOpacity
                    style={[styles.setGoalsButton, { backgroundColor: primaryColor }]}
                    onPress={() => router.push('/calorie-goals')}
                  >
                    <ThemedText style={styles.setGoalsButtonText}>Set Goals</ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            )}

            {/* Meal Type Breakdown */}
            {stats.meal_type_breakdown ? (
              <ThemedView style={[styles.mealBreakdownCard, { backgroundColor: cardBackground }]}>
                <ThemedText style={styles.sectionTitle}>Meal Type Breakdown</ThemedText>
                
                <View style={styles.mealBreakdown}>
                  {stats.meal_type_breakdown.breakfast && (
                    <View style={styles.mealTypeItem}>
                      <View style={styles.mealTypeHeader}>
                        <Ionicons name="sunny" size={20} color="#FF9800" />
                        <ThemedText style={styles.mealTypeLabel}>Breakfast</ThemedText>
                      </View>
                      <View style={styles.mealTypeStats}>
                        <ThemedText style={styles.mealTypeCalories}>
                          {Math.round(stats.meal_type_breakdown.breakfast.total_calories)} cal
                        </ThemedText>
                        <ThemedText style={styles.mealTypeCount}>
                          {stats.meal_type_breakdown.breakfast.count} entries
                        </ThemedText>
                      </View>
                    </View>
                  )}

                  {stats.meal_type_breakdown.lunch && (
                    <View style={styles.mealTypeItem}>
                      <View style={styles.mealTypeHeader}>
                        <Ionicons name="restaurant" size={20} color="#4CAF50" />
                        <ThemedText style={styles.mealTypeLabel}>Lunch</ThemedText>
                      </View>
                      <View style={styles.mealTypeStats}>
                        <ThemedText style={styles.mealTypeCalories}>
                          {Math.round(stats.meal_type_breakdown.lunch.total_calories)} cal
                        </ThemedText>
                        <ThemedText style={styles.mealTypeCount}>
                          {stats.meal_type_breakdown.lunch.count} entries
                        </ThemedText>
                      </View>
                    </View>
                  )}

                  {stats.meal_type_breakdown.dinner && (
                    <View style={styles.mealTypeItem}>
                      <View style={styles.mealTypeHeader}>
                        <Ionicons name="moon" size={20} color="#2196F3" />
                        <ThemedText style={styles.mealTypeLabel}>Dinner</ThemedText>
                      </View>
                      <View style={styles.mealTypeStats}>
                        <ThemedText style={styles.mealTypeCalories}>
                          {Math.round(stats.meal_type_breakdown.dinner.total_calories)} cal
                        </ThemedText>
                        <ThemedText style={styles.mealTypeCount}>
                          {stats.meal_type_breakdown.dinner.count} entries
                        </ThemedText>
                      </View>
                    </View>
                  )}

                  {stats.meal_type_breakdown.snack && (
                    <View style={styles.mealTypeItem}>
                      <View style={styles.mealTypeHeader}>
                        <Ionicons name="cafe" size={20} color="#9C27B0" />
                        <ThemedText style={styles.mealTypeLabel}>Snacks</ThemedText>
                      </View>
                      <View style={styles.mealTypeStats}>
                        <ThemedText style={styles.mealTypeCalories}>
                          {Math.round(stats.meal_type_breakdown.snack.total_calories)} cal
                        </ThemedText>
                        <ThemedText style={styles.mealTypeCount}>
                          {stats.meal_type_breakdown.snack.count} entries
                        </ThemedText>
                      </View>
                    </View>
                  )}
                </View>
              </ThemedView>
            ) : (
              <ThemedView style={[styles.mealBreakdownCard, { backgroundColor: cardBackground }]}>
                <ThemedText style={styles.sectionTitle}>Meal Type Breakdown</ThemedText>
                <View style={styles.noDataMessage}>
                  <Ionicons name="restaurant-outline" size={32} color={textColor + '40'} />
                  <ThemedText style={styles.noDataMessageText}>No meal data available</ThemedText>
                  <ThemedText style={styles.noDataMessageSubtext}>
                    Start logging your meals to see breakdown statistics
                  </ThemedText>
                </View>
              </ThemedView>
            )}

            {/* Total Nutrition */}
            <ThemedView style={[styles.totalNutritionCard, { backgroundColor: cardBackground }]}>
              <ThemedText style={styles.sectionTitle}>Total Nutrition</ThemedText>
              <View style={styles.totalNutritionGrid}>
                <View style={styles.totalNutritionItem}>
                  <ThemedText style={styles.totalNutritionValue}>
                    {Math.round(stats.total_calories)}
                  </ThemedText>
                  <ThemedText style={styles.totalNutritionLabel}>Total Calories</ThemedText>
                </View>
                <View style={styles.totalNutritionItem}>
                  <ThemedText style={styles.totalNutritionValue}>
                    {Math.round(stats.total_protein)}g
                  </ThemedText>
                  <ThemedText style={styles.totalNutritionLabel}>Total Protein</ThemedText>
                </View>
                <View style={styles.totalNutritionItem}>
                  <ThemedText style={styles.totalNutritionValue}>
                    {Math.round(stats.total_carbs)}g
                  </ThemedText>
                  <ThemedText style={styles.totalNutritionLabel}>Total Carbs</ThemedText>
                </View>
                <View style={styles.totalNutritionItem}>
                  <ThemedText style={styles.totalNutritionValue}>
                    {Math.round(stats.total_fat)}g
                  </ThemedText>
                  <ThemedText style={styles.totalNutritionLabel}>Total Fat</ThemedText>
                </View>
              </View>
            </ThemedView>
          </>
        )}

        {/* No Data State */}
        {!stats && (
          <View style={styles.noDataState}>
            <Ionicons name="analytics-outline" size={64} color={textColor + '40'} />
            <ThemedText style={styles.noDataTitle}>No Data Available</ThemedText>
            <ThemedText style={styles.noDataDescription}>
              Start tracking your calories to see detailed statistics
            </ThemedText>
            <TouchableOpacity
              style={[styles.startTrackingButton, { backgroundColor: primaryColor }]}
              onPress={() => router.push('/add-food')}
            >
              <ThemedText style={styles.startTrackingButtonText}>
                Start Tracking
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56, // Ensure consistent header height
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
    flex: 1,
  },
  headerSpacer: {
    width: 40, // Same width as backButton for balance
    minHeight: 40,
  },
  periodSelectorContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateRangeCard: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateRangeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateRangeSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  overviewCard: {
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  overviewItem: {
    flex: 1,
    minWidth: (width - 80) / 2,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  adherenceCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adherenceItems: {
    gap: 16,
  },
  adherenceItem: {
    gap: 8,
  },
  adherenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adherenceLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  adherenceProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adherenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  adherenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  adherencePercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
  },
  adherenceDetails: {
    fontSize: 12,
    opacity: 0.7,
  },
  mealBreakdownCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealBreakdown: {
    gap: 16,
  },
  mealTypeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealTypeStats: {
    alignItems: 'flex-end',
  },
  mealTypeCalories: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealTypeCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  totalNutritionCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalNutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  totalNutritionItem: {
    flex: 1,
    minWidth: (width - 80) / 2,
    alignItems: 'center',
  },
  totalNutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalNutritionLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  noDataState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  startTrackingButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  startTrackingButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noDataMessage: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataMessageText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataMessageSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  setGoalsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setGoalsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 