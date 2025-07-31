import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Exercise } from '../services/workoutService';

interface ExerciseConfigurationModalProps {
  visible: boolean;
  onClose: () => void;
  exercise: Exercise | null;
  onConfirm: (config: {
    exercise_id: number;
    set_count: number;
    reps_count: number;
    rest_duration: number;
  }) => void;
}

export const ExerciseConfigurationModal: React.FC<ExerciseConfigurationModalProps> = ({
  visible,
  onClose,
  exercise,
  onConfirm,
}) => {
  const [setCount, setSetCount] = useState('3');
  const [repsCount, setRepsCount] = useState('12');
  const [restDuration, setRestDuration] = useState('60');

  const handleConfirm = () => {
    console.log('[ExerciseConfigurationModal] handleConfirm called');
    console.log('[ExerciseConfigurationModal] exercise:', exercise);
    console.log('[ExerciseConfigurationModal] setCount:', setCount);
    console.log('[ExerciseConfigurationModal] repsCount:', repsCount);
    console.log('[ExerciseConfigurationModal] restDuration:', restDuration);
    
    if (!exercise) {
      console.error('[ExerciseConfigurationModal] No exercise provided');
      return;
    }

    const sets = parseInt(setCount);
    const reps = parseInt(repsCount);
    const rest = parseInt(restDuration);

    console.log('[ExerciseConfigurationModal] Parsed values - sets:', sets, 'reps:', reps, 'rest:', rest);

    // Validation
    if (isNaN(sets) || sets < 1 || sets > 10) {
      console.log('[ExerciseConfigurationModal] Invalid sets:', sets);
      Alert.alert('Invalid Input', 'Sets must be a number between 1 and 10');
      return;
    }

    if (isNaN(reps) || reps < 1 || reps > 100) {
      console.log('[ExerciseConfigurationModal] Invalid reps:', reps);
      Alert.alert('Invalid Input', 'Reps must be a number between 1 and 100');
      return;
    }

    if (isNaN(rest) || rest < 10 || rest > 600) {
      console.log('[ExerciseConfigurationModal] Invalid rest:', rest);
      Alert.alert('Invalid Input', 'Rest duration must be between 10 and 600 seconds');
      return;
    }

    const config = {
      exercise_id: exercise.id,
      set_count: sets,
      reps_count: reps,
      rest_duration: rest,
    };

    console.log('[ExerciseConfigurationModal] Calling onConfirm with config:', config);
    onConfirm(config);

    // Don't call onClose() here - let the parent component handle modal state after processing
    console.log('[ExerciseConfigurationModal] onConfirm called, letting parent handle modal state');
  };

  const handleClose = () => {
    // Reset to default values when closing
    setSetCount('3');
    setRepsCount('12');
    setRestDuration('60');
    onClose();
  };

  if (!exercise) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors.light.text }]}>
              Configure Exercise
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          {/* Exercise Info */}
          <View style={styles.exerciseInfo}>
            {exercise.exerciseIconUrl ? (
              <Image
                source={{ uri: exercise.exerciseIconUrl }}
                style={styles.exerciseIcon}
                defaultSource={require('@/assets/images/workout.png')}
              />
            ) : (
              <View style={styles.exerciseIconPlaceholder}>
                <Ionicons name="fitness" size={32} color="#fff" />
              </View>
            )}
            <View style={styles.exerciseDetails}>
              <Text style={[styles.exerciseTitle, { color: Colors.light.text }]}>
                {exercise.title}
              </Text>
              <Text style={styles.exerciseDescription}>
                {exercise.description}
              </Text>
              <Text style={styles.exerciseCalories}>
                {exercise.caloriePerRound} cal/round
              </Text>
            </View>
          </View>

          {/* Configuration Form */}
          <View style={styles.formContainer}>
            {/* Sets */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.light.text }]}>
                Sets
              </Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => {
                    const current = parseInt(setCount) || 1;
                    if (current > 1) setSetCount((current - 1).toString());
                  }}
                >
                  <Ionicons name="remove" size={20} color="#fff" />
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: Colors.light.background,
                      color: Colors.light.text,
                      borderColor: Colors.light.text,
                    },
                  ]}
                  value={setCount}
                  onChangeText={setSetCount}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => {
                    const current = parseInt(setCount) || 1;
                    if (current < 10) setSetCount((current + 1).toString());
                  }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reps */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.light.text }]}>
                Reps per Set
              </Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => {
                    const current = parseInt(repsCount) || 1;
                    if (current > 1) setRepsCount((current - 1).toString());
                  }}
                >
                  <Ionicons name="remove" size={20} color="#fff" />
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: Colors.light.background,
                      color: Colors.light.text,
                      borderColor: Colors.light.text,
                    },
                  ]}
                  value={repsCount}
                  onChangeText={setRepsCount}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => {
                    const current = parseInt(repsCount) || 1;
                    if (current < 100) setRepsCount((current + 1).toString());
                  }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Rest Duration */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.light.text }]}>
                Rest Duration (seconds)
              </Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => {
                    const current = parseInt(restDuration) || 30;
                    if (current > 10) setRestDuration((current - 10).toString());
                  }}
                >
                  <Ionicons name="remove" size={20} color="#fff" />
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: Colors.light.background,
                      color: Colors.light.text,
                      borderColor: Colors.light.text,
                    },
                  ]}
                  value={restDuration}
                  onChangeText={setRestDuration}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => {
                    const current = parseInt(restDuration) || 30;
                    if (current < 600) setRestDuration((current + 10).toString());
                  }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 500,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  exerciseInfo: {
    flexDirection: 'row',
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  exerciseIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  exerciseIconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: '#A78BFA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1a1a1a',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 6,
    lineHeight: 20,
  },
  exerciseCalories: {
    fontSize: 13,
    color: '#A78BFA',
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 24,
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#495057',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#A78BFA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    width: 80,
    height: 44,
    borderWidth: 2,
    borderColor: '#A78BFA',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#dee2e6',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
}); 