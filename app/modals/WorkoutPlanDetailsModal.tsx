import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  useColorScheme,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { 
  WorkoutService, 
  WorkoutPlan, 
  DailyPlan, 
  WorkoutExercise,
  AddDayRequest,
  Exercise 
} from '../services/workoutService';
import { ExerciseBrowserModal } from './ExerciseBrowserModal';

interface WorkoutPlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  workoutPlanId: number | null;
  onUpdate: () => void;
}

const DAY_OPTIONS: { key: AddDayRequest['day']; label: string }[] = [
  { key: 'day1', label: 'Day 1' },
  { key: 'day2', label: 'Day 2' },
  { key: 'day3', label: 'Day 3' },
  { key: 'day4', label: 'Day 4' },
  { key: 'day5', label: 'Day 5' },
  { key: 'day6', label: 'Day 6' },
  { key: 'day7', label: 'Day 7' },
];

export const WorkoutPlanDetailsModal: React.FC<WorkoutPlanDetailsModalProps> = ({
  visible,
  onClose,
  workoutPlanId,
  onUpdate,
}) => {
  const colorScheme = useColorScheme();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showExerciseBrowser, setShowExerciseBrowser] = useState(false);
  const [selectedDayForExercise, setSelectedDayForExercise] = useState<number | null>(null);

  useEffect(() => {
    if (visible && workoutPlanId) {
      fetchWorkoutPlan();
    }
  }, [visible, workoutPlanId]);

  const fetchWorkoutPlan = async () => {
    if (!workoutPlanId) return;
    
    setLoading(true);
    try {
      const response = await WorkoutService.getWorkoutPlan(workoutPlanId);
      setWorkoutPlan(response.workout_plan);
    } catch (error) {
      console.error('Error fetching workout plan:', error);
      Alert.alert('Error', 'Failed to load workout plan details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDay = async () => {
    if (!workoutPlan) return;

    const existingDays = workoutPlan.daily_plans?.map(dp => dp.day) || [];
    const nextDayNumber = existingDays.length + 1;
    
    if (nextDayNumber > 7) {
      Alert.alert('Info', 'Maximum of 7 days reached for this workout plan');
      return;
    }

    const nextDay = `day${nextDayNumber}` as AddDayRequest['day'];
    
    try {
      await WorkoutService.addDay(workoutPlan.id, { day: nextDay });
      await fetchWorkoutPlan();
      onUpdate();
    } catch (error) {
      console.error('Error adding day:', error);
      Alert.alert('Error', 'Failed to add day');
    }
  };

  const addDay = async (day: AddDayRequest['day']) => {
    if (!workoutPlan) return;

    try {
      await WorkoutService.addDay(workoutPlan.id, { day });
      await fetchWorkoutPlan();
      onUpdate();
    } catch (error) {
      console.error('Error adding day:', error);
      Alert.alert('Error', 'Failed to add day');
    }
  };

  const handleRemoveDay = async (dayId: number, dayName: string) => {
    if (!workoutPlan) return;

    Alert.alert(
      'Remove Day',
      `Are you sure you want to remove ${dayName}? This will delete all exercises for this day.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await WorkoutService.removeDay(workoutPlan.id, dayId);
              await fetchWorkoutPlan();
              onUpdate();
            } catch (error) {
              console.error('Error removing day:', error);
              Alert.alert('Error', 'Failed to remove day');
            }
          },
        },
      ]
    );
  };

  const handleAddExercise = async (dayId: number) => {
    setSelectedDayForExercise(dayId);
    setShowExerciseBrowser(true);
  };

  const handleSelectExercise = async (exercise: Exercise) => {
    if (!workoutPlan || !selectedDayForExercise) return;

    try {
      await WorkoutService.addExercise(workoutPlan.id, selectedDayForExercise, {
        exercise_id: exercise.id,
        set_count: 3,
        reps_count: 12,
        rest_duration: 60,
      });
      await fetchWorkoutPlan();
      onUpdate();
    } catch (error) {
      console.error('Error adding exercise:', error);
      Alert.alert('Error', 'Failed to add exercise');
    }
  };

  const handleRemoveExercise = async (dayId: number, exerciseId: number, exerciseTitle: string) => {
    if (!workoutPlan) return;

    Alert.alert(
      'Remove Exercise',
      `Remove ${exerciseTitle}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await WorkoutService.removeExercise(workoutPlan.id, dayId, exerciseId);
              await fetchWorkoutPlan();
              onUpdate();
            } catch (error) {
              console.error('Error removing exercise:', error);
              Alert.alert('Error', 'Failed to remove exercise');
            }
          },
        },
      ]
    );
  };

  const handlePublish = async () => {
    if (!workoutPlan) return;

    const newStatus = workoutPlan.status === 'published' ? 'draft' : 'published';
    const action = newStatus === 'published' ? 'publish' : 'unpublish';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Plan`,
      `Are you sure you want to ${action} this workout plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              await WorkoutService.updateWorkoutPlan(workoutPlan.id, { status: newStatus });
              await fetchWorkoutPlan();
              onUpdate();
            } catch (error) {
              console.error('Error updating workout plan:', error);
              Alert.alert('Error', 'Failed to update workout plan');
            }
          },
        },
      ]
    );
  };

  const renderExercise = (exercise: WorkoutExercise, dayId: number) => (
    <View key={exercise.id} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Image
          source={{ uri: exercise.exercise.exerciseIconUrl || undefined }}
          style={styles.exerciseIcon}
          defaultSource={require('@/assets/images/workout.png')}
        />
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {exercise.exercise.title}
          </Text>
          <Text style={styles.exerciseStats}>
            {exercise.set_count} sets × {exercise.reps_count} reps
          </Text>
          <Text style={styles.exerciseCalories}>
            {exercise.calorie} cal • {exercise.rest_duration}s rest
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveExercise(dayId, exercise.id, exercise.exercise.title)}
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDay = (day: DailyPlan) => (
    <View key={day.id} style={styles.dayCard}>
      <TouchableOpacity
        style={styles.dayHeader}
        onPress={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
      >
        <View style={styles.dayInfo}>
          <Text style={[styles.dayTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {day.day_display}
          </Text>
          <Text style={styles.dayStats}>
            {day.workout_exercises.length} exercises • {day.total_calories} cal
          </Text>
        </View>
        <View style={styles.dayActions}>
          <TouchableOpacity
            onPress={() => handleAddExercise(day.id)}
            style={styles.addExerciseButton}
          >
            <Ionicons name="add" size={20} color="#A78BFA" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRemoveDay(day.id, day.day_display)}
            style={styles.removeDayButton}
          >
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
          </TouchableOpacity>
          <Ionicons
            name={expandedDay === day.id ? "chevron-up" : "chevron-down"}
            size={20}
            color={Colors[colorScheme ?? 'light'].tabIconDefault}
          />
        </View>
      </TouchableOpacity>

      {expandedDay === day.id && (
        <View style={styles.exercisesList}>
          {day.workout_exercises.length > 0 ? (
            day.workout_exercises.map(exercise => renderExercise(exercise, day.id))
          ) : (
            <Text style={styles.noExercisesText}>
              No exercises added yet. Tap + to add exercises.
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (!workoutPlan && !loading) {
    return null;
  }

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Workout Plan
              </Text>
              {workoutPlan && (
                <TouchableOpacity onPress={handlePublish} style={styles.publishButton}>
                  <Text style={[
                    styles.publishText,
                    { color: workoutPlan.status === 'published' ? '#FF6B6B' : '#A78BFA' }
                  ]}>
                    {workoutPlan.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A78BFA" />
              </View>
            ) : workoutPlan ? (
              <ScrollView style={styles.content}>
                {/* Plan Info */}
                <View style={styles.planInfo}>
                  <Text style={[styles.planTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {workoutPlan.title}
                  </Text>
                  {workoutPlan.description && (
                    <Text style={styles.planDescription}>
                      {workoutPlan.description}
                    </Text>
                  )}
                  <View style={styles.planStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{workoutPlan.total_calories}</Text>
                      <Text style={styles.statLabel}>Total Calories</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{workoutPlan.daily_plans?.length || 0}</Text>
                      <Text style={styles.statLabel}>Days</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statusBadge, {
                        backgroundColor: workoutPlan.status === 'published' ? '#4CAF50' : '#FFA726',
                      }]}>
                        {workoutPlan.status_display}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Days Section */}
                <View style={styles.daysSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Days ({workoutPlan.daily_plans?.length || 0}/7)
                    </Text>
                    <TouchableOpacity onPress={handleAddDay} style={styles.addDayButton}>
                      <Ionicons name="add" size={20} color="#A78BFA" />
                      <Text style={styles.addDayText}>Add Day</Text>
                    </TouchableOpacity>
                  </View>

                  {workoutPlan.daily_plans && workoutPlan.daily_plans.length > 0 ? (
                    workoutPlan.daily_plans.map(renderDay)
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>
                        No days added yet. Start by adding your first day!
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Exercise Browser Modal */}
      <ExerciseBrowserModal
        visible={showExerciseBrowser}
        onClose={() => {
          setShowExerciseBrowser(false);
          setSelectedDayForExercise(null);
        }}
        onSelectExercise={handleSelectExercise}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  publishButton: {
    padding: 4,
  },
  publishText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  planInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A78BFA',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  daysSection: {
    padding: 20,
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
  },
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addDayText: {
    color: '#A78BFA',
    marginLeft: 4,
    fontWeight: '600',
  },
  dayCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dayInfo: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dayStats: {
    fontSize: 14,
    color: '#666',
  },
  dayActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addExerciseButton: {
    padding: 4,
  },
  removeDayButton: {
    padding: 4,
  },
  exercisesList: {
    padding: 16,
    paddingTop: 0,
  },
  exerciseCard: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseStats: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 2,
  },
  exerciseCalories: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },
  noExercisesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
}); 