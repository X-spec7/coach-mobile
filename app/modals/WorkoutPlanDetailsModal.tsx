import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { WorkoutService, WorkoutPlan, DailyPlan, Exercise, AddDayRequest, WorkoutExercise } from '../services/workoutService';
import { ExerciseBrowserModal } from './ExerciseBrowserModal';
import { ExerciseConfigurationModal } from './ExerciseConfigurationModal';
import { ApplyWorkoutPlanModal } from './ApplyWorkoutPlanModal';
import { AssignWorkoutPlanModal } from './AssignWorkoutPlanModal';
import { useAuth } from '../contexts/AuthContext';

interface WorkoutPlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  workoutPlanId: string | null;
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
  const { user } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showExerciseBrowser, setShowExerciseBrowser] = useState(false);
  const [selectedDayForExercise, setSelectedDayForExercise] = useState<number | null>(null);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [showExerciseConfig, setShowExerciseConfig] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showApplyWorkoutPlanModal, setShowApplyWorkoutPlanModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Ref to track if we're programmatically closing the exercise browser
  const isProgrammaticCloseRef = useRef(false);

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
      console.log('[fetchWorkoutPlan] Received workout plan with is_public:', response.workout_plan.is_public);
      setWorkoutPlan(response.workout_plan);
    } catch (error) {
      console.error('Error fetching workout plan:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workout plan details';
      
      // Don't show alert for authentication required errors - user will be redirected to login
      if (errorMessage.includes('Authentication required')) {
        console.log('Authentication required, user will be redirected to login');
        // Close the modal since user is being redirected
        onClose();
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDays = () => {
    if (!workoutPlan) return [];
    
    const existingDays = workoutPlan.daily_plans?.map(dp => dp.day) || [];
    return DAY_OPTIONS.filter(dayOption => !existingDays.includes(dayOption.key));
  };

  const getSortedDailyPlans = () => {
    if (!workoutPlan?.daily_plans) return [];
    
    // Create a mapping for day order
    const dayOrder: Record<string, number> = {
      'day1': 1,
      'day2': 2,
      'day3': 3,
      'day4': 4,
      'day5': 5,
      'day6': 6,
      'day7': 7,
    };
    
    // Sort daily plans by day order
    return [...workoutPlan.daily_plans].sort((a, b) => {
      const orderA = dayOrder[a.day] || 999;
      const orderB = dayOrder[b.day] || 999;
      return orderA - orderB;
    });
  };

  const handleAddDay = async () => {
    if (!workoutPlan) return;

    const availableDays = getAvailableDays();
    
    if (availableDays.length === 0) {
      Alert.alert('Info', 'All days have been added to this workout plan');
      return;
    }

    // If only one day available, add it directly
    if (availableDays.length === 1) {
      await addDay(availableDays[0].key);
      return;
    }

    // Show day selector for multiple options
    setShowDaySelector(true);
  };

  const addDay = async (day: AddDayRequest['day']) => {
    if (!workoutPlan) return;

    try {
      await WorkoutService.addDay(workoutPlan.id, { day });
      await fetchWorkoutPlan();
      onUpdate();
    } catch (error) {
      console.error('Error adding day:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to add day';
      
      // Don't show alert for authentication required errors - user will be redirected to login
      if (errorMessage.includes('Authentication required')) {
        console.log('Authentication required, user will be redirected to login');
        onClose();
      } else {
        Alert.alert('Error', errorMessage);
      }
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
              
              const errorMessage = error instanceof Error ? error.message : 'Failed to remove day';
              
              // Don't show alert for authentication required errors - user will be redirected to login
              if (errorMessage.includes('Authentication required')) {
                console.log('Authentication required, user will be redirected to login');
                onClose();
              } else {
                Alert.alert('Error', errorMessage);
              }
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

  const handleExerciseBrowserClose = () => {
    // Check if this is a programmatic close
    if (isProgrammaticCloseRef.current) {
      // Reset the flag and don't clear selectedDayForExercise
      isProgrammaticCloseRef.current = false;
      setShowExerciseBrowser(false);
      return;
    }
    
    // Manual close - clear the day selection
    setShowExerciseBrowser(false);
    setSelectedDayForExercise(null);
  };

  const handleSelectExercise = async (exercise: Exercise) => {
    
    // Set flag to indicate programmatic close
    isProgrammaticCloseRef.current = true;
    
    // Close the exercise browser and show the configuration modal
    setShowExerciseBrowser(false);
    setSelectedExercise(exercise);
    setShowExerciseConfig(true);
  };

  const handleExerciseConfigurationClose = () => {
    // Manual close - clear all states
    setShowExerciseConfig(false);
    setSelectedExercise(null);
    setSelectedDayForExercise(null);
  };

  const handleExerciseConfiguration = async (config: {
    exercise_id: number;
    set_count: number;
    reps_count: number;
    rest_duration: number;
  }) => {
    
    if (!workoutPlan || !selectedDayForExercise) {
      console.error('[handleExerciseConfiguration] Missing workoutPlan or selectedDayForExercise');
      return;
    }

    try {
      const result = await WorkoutService.addExercise(workoutPlan.id, selectedDayForExercise, config);
      
      await fetchWorkoutPlan();
      onUpdate();
      
      // Reset states after successful addition
      setSelectedExercise(null);
      setSelectedDayForExercise(null);
      setShowExerciseConfig(false);
    } catch (error) {
      console.error('[handleExerciseConfiguration] Error adding exercise:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to add exercise';
      
      // Don't show alert for authentication required errors - user will be redirected to login
      if (errorMessage.includes('Authentication required')) {
        console.log('Authentication required, user will be redirected to login');
        onClose();
      } else {
        Alert.alert('Error', errorMessage);
      }
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
              
              const errorMessage = error instanceof Error ? error.message : 'Failed to remove exercise';
              
              // Don't show alert for authentication required errors - user will be redirected to login
              if (errorMessage.includes('Authentication required')) {
                console.log('Authentication required, user will be redirected to login');
                onClose();
              } else {
                Alert.alert('Error', errorMessage);
              }
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
              
              const errorMessage = error instanceof Error ? error.message : 'Failed to update workout plan';
              
              // Don't show alert for authentication required errors - user will be redirected to login
              if (errorMessage.includes('Authentication required')) {
                console.log('Authentication required, user will be redirected to login');
                onClose();
              } else {
                Alert.alert('Error', errorMessage);
              }
            }
          },
        },
      ]
    );
  };

  const handleTogglePublic = async () => {
    if (!workoutPlan) return;

    console.log('[handleTogglePublic] Current is_public:', workoutPlan.is_public);
    const newPublicStatus = !workoutPlan.is_public;
    console.log('[handleTogglePublic] New is_public will be:', newPublicStatus);
    const action = newPublicStatus ? 'make public' : 'make private';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)}`,
      `Are you sure you want to ${action} this workout plan? ${newPublicStatus ? 'Other users will be able to discover and apply it.' : 'It will no longer be visible to other users.'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              console.log('[handleTogglePublic] Calling API with is_public:', newPublicStatus);
              // Call the actual backend API to update is_public status
              const response = await WorkoutService.updateWorkoutPlan(workoutPlan.id, { 
                is_public: newPublicStatus 
              });
              console.log('[handleTogglePublic] API response:', response);
              
              // Refresh the workout plan to get updated data
              await fetchWorkoutPlan();
              onUpdate();
              
              // Show success message after UI has been updated
              setTimeout(() => {
                Alert.alert(
                  'Success', 
                  `Workout plan is now ${newPublicStatus ? 'public' : 'private'}.`
                );
              }, 100);
            } catch (error) {
              console.error('Error updating workout plan visibility:', error);
              
              const errorMessage = error instanceof Error ? error.message : 'Failed to update workout plan visibility';
              
              // Don't show alert for authentication required errors - user will be redirected to login
              if (errorMessage.includes('Authentication required')) {
                console.log('Authentication required, user will be redirected to login');
                onClose();
              } else {
                Alert.alert('Error', errorMessage);
              }
            }
          },
        },
      ]
    );
  };

  const handleApplyWorkoutPlan = () => {
    setShowApplyWorkoutPlanModal(true);
  };

  const handleApplyWorkoutPlanClose = () => {
    setShowApplyWorkoutPlanModal(false);
  };

  const handleApplyWorkoutPlanSuccess = () => {
    setShowApplyWorkoutPlanModal(false);
    Alert.alert('Success', 'Workout plan applied successfully! Check your scheduled workouts.');
    onUpdate();
  };

  const handleAssignWorkoutPlan = () => {
    setShowAssignModal(true);
  };

  const handleAssignWorkoutPlanClose = () => {
    setShowAssignModal(false);
  };

  const handleAssignWorkoutPlanSuccess = () => {
    setShowAssignModal(false);
    Alert.alert('Success', 'Workout plan assigned successfully!');
    onUpdate();
  };

  const renderExercise = (exercise: WorkoutExercise, dayId: number) => (
    <View key={exercise.id} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        {exercise.exercise.exerciseIconUrl ? (
          <Image
            source={{ uri: exercise.exercise.exerciseIconUrl }}
            style={styles.exerciseIcon}
            defaultSource={require('@/assets/images/workout.png')}
          />
        ) : (
          <View style={styles.exerciseIconPlaceholder}>
            <Ionicons name="fitness" size={24} color="#A78BFA" />
          </View>
        )}
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseTitle, { color: Colors.light.text }]}>
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
          <Text style={[styles.dayTitle, { color: Colors.light.text }]}>
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
            color={Colors.light.tabIconDefault}
          />
        </View>
      </TouchableOpacity>

      {expandedDay === day.id && (
        <View style={styles.exercisesList}>
          {day.workout_exercises.length > 0 ? (
            [...day.workout_exercises]
              .sort((a, b) => a.order - b.order)
              .map(exercise => renderExercise(exercise, day.id))
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
          <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
                Workout Plan
              </Text>
              {workoutPlan && (
                <View style={styles.headerActions}>
                  <TouchableOpacity onPress={handleTogglePublic} style={styles.actionButton}>
                    <Ionicons 
                      name={workoutPlan.is_public ? "globe" : "lock-closed"} 
                      size={20} 
                      color={workoutPlan.is_public ? "#4CAF50" : "#666"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handlePublish} style={styles.actionButton}>
                    <Text style={[
                      styles.publishText,
                      { color: workoutPlan.status === 'published' ? '#FF6B6B' : '#A78BFA' }
                    ]}>
                      {workoutPlan.status === 'published' ? 'Unpublish' : 'Publish'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleApplyWorkoutPlan} style={styles.actionButton}>
                    <Ionicons name="calendar-outline" size={20} color="#A78BFA" />
                  </TouchableOpacity>
                  {user?.userType === 'Coach' && (
                    <TouchableOpacity onPress={handleAssignWorkoutPlan} style={styles.actionButton}>
                      <Ionicons name="person-add-outline" size={20} color="#A78BFA" />
                    </TouchableOpacity>
                  )}
                </View>
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
                  <Text style={[styles.planTitle, { color: Colors.light.text }]}>
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
                      <View style={[styles.statusBadge, {
                        backgroundColor: workoutPlan.status === 'published' ? '#4CAF50' : '#FFA726',
                      }]}>
                        <Text style={styles.statusText}>{workoutPlan.status_display}</Text>
                      </View>
                    </View>
                    <View style={styles.statItem}>
                      <View style={[styles.visibilityBadge, {
                        backgroundColor: workoutPlan.is_public ? '#4CAF50' : '#666',
                      }]}>
                        <Ionicons 
                          name={workoutPlan.is_public ? "globe" : "lock-closed"} 
                          size={12} 
                          color="#fff" 
                        />
                        <Text style={styles.visibilityText}>
                          {workoutPlan.is_public ? 'Public' : 'Private'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Days Section */}
                <View style={styles.daysSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                      Days ({workoutPlan.daily_plans?.length || 0}/7)
                    </Text>
                    <TouchableOpacity onPress={handleAddDay} style={styles.addDayButton}>
                      <Ionicons name="add" size={20} color="#A78BFA" />
                      <Text style={styles.addDayText}>Add Day</Text>
                    </TouchableOpacity>
                  </View>

                  {workoutPlan.daily_plans && workoutPlan.daily_plans.length > 0 ? (
                    getSortedDailyPlans().map(renderDay)
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
        onClose={handleExerciseBrowserClose}
        onSelectExercise={handleSelectExercise}
      />

      {/* Exercise Configuration Modal */}
      <ExerciseConfigurationModal
        visible={showExerciseConfig}
        onClose={handleExerciseConfigurationClose}
        exercise={selectedExercise}
        onConfirm={handleExerciseConfiguration}
      />

      {/* Day Selector Modal */}
      <Modal
        visible={showDaySelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDaySelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.daySelectorContainer, { backgroundColor: Colors.light.background }]}>
            <View style={styles.daySelectorHeader}>
              <Text style={[styles.daySelectorTitle, { color: Colors.light.text }]}>
                Select Day to Add
              </Text>
              <TouchableOpacity
                onPress={() => setShowDaySelector(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dayOptionsContainer}>
              {getAvailableDays().map((dayOption) => (
                <TouchableOpacity
                  key={dayOption.key}
                  style={[styles.dayOptionButton, { borderColor: Colors.light.text }]}
                  onPress={async () => {
                    setShowDaySelector(false);
                    await addDay(dayOption.key);
                  }}
                >
                  <Text style={[styles.dayOptionText, { color: Colors.light.text }]}>
                    {dayOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Apply Workout Plan Modal */}
      <ApplyWorkoutPlanModal
        visible={showApplyWorkoutPlanModal}
        onClose={handleApplyWorkoutPlanClose}
        workoutPlan={workoutPlan ? {
          ...workoutPlan,
          applications_count: workoutPlan.applications_count || 0
        } : null}
        onSuccess={handleApplyWorkoutPlanSuccess}
      />

      {/* Assign Workout Plan Modal */}
      <AssignWorkoutPlanModal
        visible={showAssignModal}
        onClose={handleAssignWorkoutPlanClose}
        workoutPlanId={workoutPlan?.id || ''}
        workoutPlanTitle={workoutPlan?.title || ''}
        onSuccess={handleAssignWorkoutPlanSuccess}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  exerciseIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  daySelectorContainer: {
    width: '80%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  daySelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  daySelectorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dayOptionsContainer: {
    padding: 15,
  },
  dayOptionButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
  },
  dayOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 