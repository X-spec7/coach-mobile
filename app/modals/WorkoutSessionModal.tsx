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
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { 
  WorkoutService, 
  ScheduledWorkout, 
  CompletedExercise,
  WorkoutExercise
} from '../services/workoutService';

interface WorkoutSessionModalProps {
  visible: boolean;
  onClose: () => void;
  scheduledWorkout: ScheduledWorkout | null;
  onUpdate: () => void;
}

export const WorkoutSessionModal: React.FC<WorkoutSessionModalProps> = ({
  visible,
  onClose,
  scheduledWorkout,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [exerciseProgress, setExerciseProgress] = useState<CompletedExercise[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [completionNotes, setCompletionNotes] = useState<Record<number, string>>({});
  const [completedSets, setCompletedSets] = useState<Record<number, number>>({});

  useEffect(() => {
    if (visible && scheduledWorkout) {
      fetchExerciseProgress();
    }
  }, [visible, scheduledWorkout]);

  const fetchExerciseProgress = async () => {
    if (!scheduledWorkout) return;
    
    setLoading(true);
    try {
      const response = await WorkoutService.getExerciseProgress(scheduledWorkout.id);
      setExerciseProgress(response.exercises_progress);
      
      // Initialize completed sets and notes
      const initialSets: Record<number, number> = {};
      const initialNotes: Record<number, string> = {};
      
      response.exercises_progress.forEach((exercise) => {
        initialSets[exercise.workout_exercise.id] = exercise.completed_sets;
        initialNotes[exercise.workout_exercise.id] = exercise.notes || '';
      });
      
      setCompletedSets(initialSets);
      setCompletionNotes(initialNotes);
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load exercise progress';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('Authentication required, user will be redirected to login');
        onClose();
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteExercise = async (exercise: WorkoutExercise) => {
    if (!scheduledWorkout) return;

    const sets = completedSets[exercise.id] || 0;
    const notes = completionNotes[exercise.id] || '';

    if (sets === 0) {
      Alert.alert('Validation Error', 'Please set the number of completed sets before marking as complete.');
      return;
    }

    try {
      await WorkoutService.completeExercise({
        scheduled_workout_id: scheduledWorkout.id,
        workout_exercise_id: exercise.id,
        completed_sets: sets,
        notes: notes,
      });

      await fetchExerciseProgress();
      onUpdate();
    } catch (error) {
      console.error('Error completing exercise:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete exercise';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('Authentication required, user will be redirected to login');
        onClose();
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleUncompleteExercise = async (exercise: WorkoutExercise) => {
    if (!scheduledWorkout) return;

    try {
      await WorkoutService.uncompleteExercise(scheduledWorkout.id, exercise.id);
      await fetchExerciseProgress();
      onUpdate();
    } catch (error) {
      console.error('Error uncompleting exercise:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to uncomplete exercise';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('Authentication required, user will be redirected to login');
        onClose();
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleCompleteWorkout = async () => {
    if (!scheduledWorkout) return;

    Alert.alert(
      'Complete Workout',
      'Mark all exercises as completed? This will complete the entire workout session.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete All',
          onPress: async () => {
            try {
              await WorkoutService.completeWorkout({
                scheduled_workout_id: scheduledWorkout.id,
              });
              
              await fetchExerciseProgress();
              onUpdate();
              Alert.alert('Success', 'Workout completed successfully!');
            } catch (error) {
              console.error('Error completing workout:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to complete workout';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const updateCompletedSets = (exerciseId: number, delta: number) => {
    setCompletedSets(prev => {
      const current = prev[exerciseId] || 0;
      const newValue = Math.max(0, Math.min(current + delta, getMaxSets(exerciseId)));
      return { ...prev, [exerciseId]: newValue };
    });
  };

  const getMaxSets = (exerciseId: number) => {
    const exercise = exerciseProgress.find(e => e.workout_exercise.id === exerciseId);
    return exercise?.workout_exercise.set_count || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCompletionPercentage = () => {
    if (exerciseProgress.length === 0) return 0;
    const completedCount = exerciseProgress.filter(e => e.is_fully_completed).length;
    return Math.round((completedCount / exerciseProgress.length) * 100);
  };

  const renderExercise = (exerciseData: CompletedExercise) => {
    const { workout_exercise, is_fully_completed } = exerciseData;
    const isExpanded = expandedExercise === workout_exercise.id;
    const completedSetsCount = completedSets[workout_exercise.id] || 0;

    return (
      <View key={workout_exercise.id} style={styles.exerciseCard}>
        <TouchableOpacity
          style={styles.exerciseHeader}
          onPress={() => setExpandedExercise(isExpanded ? null : workout_exercise.id)}
        >
          {workout_exercise.exercise.exerciseIconUrl ? (
            <Image
              source={{ uri: workout_exercise.exercise.exerciseIconUrl }}
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
              {workout_exercise.exercise.title}
            </Text>
            <Text style={styles.exerciseDetails}>
              {workout_exercise.set_count} sets × {workout_exercise.reps_count} reps
            </Text>
            <Text style={styles.exerciseCalories}>
              {workout_exercise.calorie} cal • {workout_exercise.rest_duration}s rest
            </Text>
          </View>
          <View style={styles.exerciseStatus}>
            {is_fully_completed ? (
              <View style={[styles.statusBadge, { backgroundColor: '#66BB6A' }]}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
              </View>
            ) : (
              <View style={styles.progressIndicator}>
                <Text style={styles.setsProgress}>
                  {completedSetsCount}/{workout_exercise.set_count}
                </Text>
              </View>
            )}
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors.light.tabIconDefault}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.exerciseDetailsContainer}>
            <Text style={[styles.exerciseDescription, { color: Colors.light.text }]}>
              {workout_exercise.exercise.description}
            </Text>

            {/* Sets Counter */}
            <View style={styles.setsContainer}>
              <Text style={[styles.setsLabel, { color: Colors.light.text }]}>
                Completed Sets
              </Text>
              <View style={styles.setsCounter}>
                <TouchableOpacity
                  style={styles.setButton}
                  onPress={() => updateCompletedSets(workout_exercise.id, -1)}
                  disabled={completedSetsCount <= 0}
                >
                  <Ionicons name="remove" size={20} color="#A78BFA" />
                </TouchableOpacity>
                <Text style={[styles.setsCount, { color: Colors.light.text }]}>
                  {completedSetsCount} / {workout_exercise.set_count}
                </Text>
                <TouchableOpacity
                  style={styles.setButton}
                  onPress={() => updateCompletedSets(workout_exercise.id, 1)}
                  disabled={completedSetsCount >= workout_exercise.set_count}
                >
                  <Ionicons name="add" size={20} color="#A78BFA" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: Colors.light.text }]}>
                Notes (optional)
              </Text>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: Colors.light.background,
                    color: Colors.light.text,
                    borderColor: Colors.light.tabIconDefault + '40',
                  },
                ]}
                value={completionNotes[workout_exercise.id] || ''}
                onChangeText={(text) => setCompletionNotes(prev => ({
                  ...prev,
                  [workout_exercise.id]: text,
                }))}
                placeholder="How did this exercise feel?"
                placeholderTextColor={Colors.light.tabIconDefault}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.exerciseActions}>
              {is_fully_completed ? (
                <TouchableOpacity
                  style={styles.uncompleteButton}
                  onPress={() => handleUncompleteExercise(workout_exercise)}
                >
                  <Ionicons name="refresh" size={16} color="#FFA726" />
                  <Text style={styles.uncompleteButtonText}>Mark Incomplete</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    completedSetsCount === 0 && styles.completeButtonDisabled,
                  ]}
                  onPress={() => handleCompleteExercise(workout_exercise)}
                  disabled={completedSetsCount === 0}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.completeButtonText}>Complete Exercise</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (!scheduledWorkout) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
              Workout Session
            </Text>
            <TouchableOpacity onPress={handleCompleteWorkout} style={styles.completeAllButton}>
              <Text style={styles.completeAllText}>Complete All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
            </View>
          ) : (
            <ScrollView style={styles.content}>
              {/* Workout Info */}
              <View style={styles.workoutInfo}>
                <Text style={[styles.workoutTitle, { color: Colors.light.text }]}>
                  {scheduledWorkout.workout_plan_title}
                </Text>
                <Text style={styles.workoutDay}>{scheduledWorkout.daily_plan.day_display}</Text>
                <Text style={styles.workoutDate}>{formatDate(scheduledWorkout.scheduled_date)}</Text>
                
                <View style={styles.progressOverview}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${getCompletionPercentage()}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {getCompletionPercentage()}% Complete
                  </Text>
                </View>
              </View>

              {/* Exercises List */}
              <View style={styles.exercisesSection}>
                <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                  Exercises ({exerciseProgress.filter(e => e.is_fully_completed).length}/{exerciseProgress.length})
                </Text>
                
                {exerciseProgress.map(renderExercise)}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
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
  completeAllButton: {
    padding: 4,
  },
  completeAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#66BB6A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  workoutInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutDay: {
    fontSize: 16,
    color: '#A78BFA',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  progressOverview: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A78BFA',
  },
  exercisesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  exerciseCard: {
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
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  exerciseIconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
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
  exerciseDetails: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 2,
  },
  exerciseCalories: {
    fontSize: 12,
    color: '#666',
  },
  exerciseStatus: {
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressIndicator: {
    alignItems: 'center',
  },
  setsProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A78BFA',
  },
  exerciseDetailsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  exerciseDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  setsContainer: {
    marginBottom: 16,
  },
  setsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  setsCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  setButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A78BFA20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsCount: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'center',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#66BB6A',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  completeButtonDisabled: {
    backgroundColor: '#666',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uncompleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFA726',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  uncompleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 