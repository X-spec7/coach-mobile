import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { WorkoutService, Exercise } from '../services/workoutService';

interface ExerciseBrowserModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export const ExerciseBrowserModal: React.FC<ExerciseBrowserModalProps> = ({
  visible,
  onClose,
  onSelectExercise,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      fetchExercises();
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = exercises.filter(exercise =>
        exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExercises(filtered);
    } else {
      setFilteredExercises(exercises);
    }
  }, [searchQuery, exercises]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await WorkoutService.getExercises();
      setExercises(response.exercises);
      setFilteredExercises(response.exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load exercises';
      
      // Don't show alert for authentication required errors - user will be redirected to login
      if (errorMessage.includes('Authentication required')) {
        console.log('Authentication required, user will be redirected to login');
        onClose();
      } else {
        // For other errors, we can show an alert or handle them silently
        console.error('Failed to load exercises:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    onClose();
  };

  const renderExercise = (exercise: Exercise) => (
    <TouchableOpacity
      key={exercise.id}
      style={styles.exerciseCard}
      onPress={() => handleSelectExercise(exercise)}
    >
      <View style={styles.exerciseContent}>
        {exercise.exerciseIconUrl ? (
          <Image
            source={{ uri: exercise.exerciseIconUrl }}
            style={styles.exerciseIcon}
            defaultSource={require('@/assets/images/workout.png')}
          />
        ) : (
          <View style={styles.exerciseIconPlaceholder}>
            <Ionicons name="fitness" size={24} color="#A78BFA" />
          </View>
        )}
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseTitle}>
            {exercise.title}
          </Text>
          <Text style={styles.exerciseDescription} numberOfLines={2}>
            {exercise.description}
          </Text>
          <View style={styles.exerciseStats}>
            <View style={styles.statItem}>
              <Ionicons 
                name="flame-outline" 
                size={16} 
                color="#A78BFA" 
              />
              <Text style={styles.statText}>
                {exercise.caloriePerRound} cal/round
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: Colors.light.background }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons 
                name="close" 
                size={24} 
                color={Colors.light.text} 
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.headerTitle,
                { color: Colors.light.text }
              ]}
            >
              Select Exercise
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchInput,
                {
                  backgroundColor: Colors.light.tabIconDefault + '20',
                  borderColor: Colors.light.tabIconDefault + '40',
                }
              ]}
            >
              <Ionicons 
                name="search" 
                size={20} 
                color={Colors.light.tabIconDefault} 
              />
              <TextInput
                style={[
                  styles.searchTextInput,
                  { color: Colors.light.text }
                ]}
                placeholder="Search exercises..."
                placeholderTextColor={Colors.light.tabIconDefault}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons 
                    name="close-circle" 
                    size={20} 
                    color={Colors.light.tabIconDefault} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Exercise List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text
                style={[
                  styles.loadingText,
                  { color: Colors.light.tabIconDefault }
                ]}
              >
                Loading exercises...
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.exercisesList}>
              {filteredExercises.length > 0 ? (
                <View style={styles.exercisesContainer}>
                  {filteredExercises.map(renderExercise)}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons 
                    name="barbell-outline" 
                    size={48} 
                    color={Colors.light.tabIconDefault} 
                  />
                  <Text
                    style={[
                      styles.emptyStateText,
                      { color: Colors.light.tabIconDefault }
                    ]}
                  >
                    {searchQuery ? 'No exercises found' : 'No exercises available'}
                  </Text>
                  {searchQuery && (
                    <Text
                      style={[
                        styles.emptyStateSubtext,
                        { color: Colors.light.tabIconDefault }
                      ]}
                    >
                      Try adjusting your search terms
                    </Text>
                  )}
                </View>
              )}
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
  placeholder: {
    width: 32,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 16,
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
  exercisesList: {
    flex: 1,
  },
  exercisesContainer: {
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#E0E0E0', // A light gray background for placeholder
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  exerciseDescription: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  exerciseStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
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