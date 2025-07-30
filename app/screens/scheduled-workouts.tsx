import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { WorkoutService, ScheduledWorkout } from '../services/workoutService';
import { WorkoutSessionModal } from '../modals/WorkoutSessionModal';

export default function ScheduledWorkoutsScreen() {
  const colorScheme = useColorScheme();
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<ScheduledWorkout | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    fetchScheduledWorkouts();
  }, [filter]);

  const fetchScheduledWorkouts = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      let params: any = {};
      
      if (filter === 'upcoming') {
        params.date_from = today;
        params.completed = false;
      } else if (filter === 'completed') {
        params.completed = true;
      }

      const response = await WorkoutService.getScheduledWorkouts(params);
      setScheduledWorkouts(response.scheduled_workouts);
    } catch (error) {
      console.error('Error fetching scheduled workouts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load scheduled workouts';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('User not authenticated, skipping fetch');
        setScheduledWorkouts([]);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchScheduledWorkouts();
    setRefreshing(false);
  };

  const handleWorkoutPress = (workout: ScheduledWorkout) => {
    setSelectedWorkout(workout);
    setShowWorkoutModal(true);
  };

  const handleWorkoutUpdate = () => {
    fetchScheduledWorkouts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return '#666';
    if (percentage < 50) return '#FFA726';
    if (percentage < 100) return '#29B6F6';
    return '#66BB6A';
  };

  const renderWorkout = ({ item }: { item: ScheduledWorkout }) => (
    <TouchableOpacity
      style={[styles.workoutCard, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      onPress={() => handleWorkoutPress(item)}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutInfo}>
          <Text style={[styles.workoutTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {item.workout_plan_title}
          </Text>
          <Text style={styles.workoutDay}>{item.daily_plan.day_display}</Text>
          <Text style={styles.workoutDate}>{formatDate(item.scheduled_date)}</Text>
        </View>
        
        <View style={styles.workoutStatus}>
          {item.is_completed ? (
            <View style={[styles.statusBadge, { backgroundColor: '#66BB6A' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.statusText}>Completed</Text>
            </View>
          ) : (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: '#333' }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.completion_percentage}%`,
                      backgroundColor: getProgressColor(item.completion_percentage),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(item.completion_percentage)}%
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.workoutStats}>
        <View style={styles.statItem}>
          <Ionicons name="fitness" size={16} color="#A78BFA" />
          <Text style={styles.statText}>
            {item.completed_exercises_count}/{item.total_exercises} exercises
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="flame" size={16} color="#A78BFA" />
          <Text style={styles.statText}>{item.daily_plan.total_calories} cal</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="calendar" size={16} color="#A78BFA" />
          <Text style={styles.statText}>Week {item.week_number}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            My Workouts
          </Text>
          <Text style={styles.headerSubtitle}>
            Track your scheduled workout sessions
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['upcoming', 'completed', 'all'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterTab,
              filter === filterType && styles.filterTabActive,
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === filterType && styles.filterTabTextActive,
              ]}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Workouts List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            Loading your workouts...
          </Text>
        </View>
      ) : (
        <FlatList
          data={scheduledWorkouts}
          renderItem={renderWorkout}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#A78BFA']}
              tintColor="#A78BFA"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons 
                name="calendar-outline" 
                size={64} 
                color={Colors[colorScheme ?? 'light'].tabIconDefault} 
              />
              <Text style={[styles.emptyStateText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                {filter === 'upcoming' 
                  ? 'No upcoming workouts scheduled'
                  : filter === 'completed'
                  ? 'No completed workouts yet'
                  : 'No workouts found'
                }
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                {filter === 'upcoming' 
                  ? 'Apply a workout plan to get started!'
                  : 'Complete some workouts to see them here'
                }
              </Text>
            </View>
          }
        />
      )}

      {/* Workout Session Modal */}
      <WorkoutSessionModal
        visible={showWorkoutModal}
        onClose={() => {
          setShowWorkoutModal(false);
          setSelectedWorkout(null);
        }}
        scheduledWorkout={selectedWorkout}
        onUpdate={handleWorkoutUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  filterTabActive: {
    backgroundColor: '#A78BFA',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  workoutCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutDay: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 2,
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
  },
  workoutStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  progressContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  progressBar: {
    width: 80,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyState: {
    alignItems: 'center',
    padding: 50,
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});