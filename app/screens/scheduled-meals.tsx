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
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MealTrackingService, ScheduledMeal } from '../services/mealTrackingService';

export default function ScheduledMealsScreen() {
  const { user } = useAuth();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [scheduledMeals, setScheduledMeals] = useState<ScheduledMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date || new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchScheduledMeals();
  }, [selectedDate, filter]);

  const fetchScheduledMeals = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params: any = {
        date_from: selectedDate,
        date_to: selectedDate,
      };

      if (filter !== 'all') {
        params.is_completed = filter === 'completed';
      }

      const response = await MealTrackingService.getScheduledMeals(params);
      setScheduledMeals(response.scheduled_meals);
    } catch (error) {
      console.error('Error fetching scheduled meals:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load scheduled meals';
      
      if (!errorMessage.includes('Authentication required')) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchScheduledMeals(true);
  };

  const handleMealPress = (meal: ScheduledMeal) => {
    router.push({
      pathname: '/meal-detail',
      params: { mealId: meal.id }
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDateOptions = () => {
    const options = [];
    for (let i = -3; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : i === -1 ? 'Yesterday' : 
        date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      options.push({ value: dateString, label });
    }
    return options;
  };

  const renderMeal = (meal: ScheduledMeal) => (
    <TouchableOpacity
      key={meal.id}
      style={styles.mealCard}
      onPress={() => handleMealPress(meal)}
    >
      <View style={styles.mealHeader}>
        <View style={styles.mealInfo}>
          <Text style={styles.mealName}>{meal.meal_time_name}</Text>
          <Text style={styles.mealTime}>{formatTime(meal.meal_time_time)}</Text>
          <Text style={styles.mealPlanInfo}>
            Week {meal.week_number} • {meal.daily_plan_day}
          </Text>
        </View>
        <View style={styles.mealStatus}>
          <View style={[
            styles.completionBadge,
            { backgroundColor: meal.is_completed ? '#4CAF50' : meal.completion_percentage > 0 ? '#FFA726' : '#E0E0E0' }
          ]}>
            <Text style={[
              styles.completionText,
              { color: meal.is_completed || meal.completion_percentage > 0 ? '#fff' : '#666' }
            ]}>
              {meal.is_completed ? '✓' : `${Math.round(meal.completion_percentage)}%`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.mealProgress}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { 
              width: `${meal.completion_percentage}%`,
              backgroundColor: meal.is_completed ? '#4CAF50' : '#FFA726'
            }
          ]} />
        </View>
        <Text style={styles.progressText}>
          {meal.consumed_foods_count}/{meal.total_foods_count} items logged
        </Text>
      </View>

      <View style={styles.mealFooter}>
        <View style={styles.actionHint}>
          <Text style={styles.actionText}>Tap to log food consumption</Text>
          <Ionicons name="chevron-forward" size={16} color="#A78BFA" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No meals scheduled</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'completed' 
          ? "No completed meals for this date."
          : filter === 'pending'
          ? "No pending meals for this date."
          : "No meals scheduled for this date."}
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
        <Text style={styles.headerTitle}>Meal Tracking</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Date Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.dateSelector}
        contentContainerStyle={styles.dateSelectorContent}
      >
        {getDateOptions().map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.dateButton,
              selectedDate === option.value && styles.selectedDateButton
            ]}
            onPress={() => setSelectedDate(option.value)}
          >
            <Text style={[
              styles.dateButtonText,
              selectedDate === option.value && styles.selectedDateText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.activeFilterTab]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.activeFilterTab]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
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
            <Text style={styles.loadingText}>Loading meals...</Text>
          </View>
        ) : scheduledMeals.length > 0 ? (
          <View style={styles.mealsList}>
            {scheduledMeals.map(renderMeal)}
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
  dateSelector: {
    backgroundColor: '#f8f9fa',
  },
  dateSelectorContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedDateButton: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedDateText: {
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  activeFilterTab: {
    backgroundColor: '#A78BFA',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterText: {
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
  mealsList: {
    gap: 16,
  },
  mealCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  mealPlanInfo: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
    marginTop: 2,
  },
  mealStatus: {
    alignItems: 'flex-end',
  },
  completionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  mealProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
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