import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { WorkoutService, PublicWorkoutPlan } from './services/workoutService';

// All available workout categories
const WORKOUT_CATEGORIES = [
  { 
    id: 'strength_training', 
    title: 'Strength Training',
    description: 'Build muscle and increase strength',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
  },
  { 
    id: 'cardio', 
    title: 'Cardio',
    description: 'Improve cardiovascular fitness',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500',
  },
  { 
    id: 'flexibility', 
    title: 'Flexibility',
    description: 'Enhance flexibility and mobility',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
  },
  { 
    id: 'hiit', 
    title: 'High-Intensity Interval Training',
    description: 'Maximum intensity, short rest periods',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  { 
    id: 'yoga', 
    title: 'Yoga',
    description: 'Mind-body connection and flexibility',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
  },
  { 
    id: 'pilates', 
    title: 'Pilates',
    description: 'Core strength and body control',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  { 
    id: 'crossfit', 
    title: 'CrossFit',
    description: 'Functional movements at high intensity',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  { 
    id: 'bodyweight', 
    title: 'Bodyweight',
    description: 'No equipment needed workouts',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  { 
    id: 'sports', 
    title: 'Sports',
    description: 'Sport-specific training programs',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  { 
    id: 'rehabilitation', 
    title: 'Rehabilitation',
    description: 'Recovery and injury prevention',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  { 
    id: 'general_fitness', 
    title: 'General Fitness',
    description: 'Overall health and wellness',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  { 
    id: 'weight_loss', 
    title: 'Weight Loss',
    description: 'Calorie-burning and fat reduction',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  { 
    id: 'muscle_gain', 
    title: 'Muscle Gain',
    description: 'Build lean muscle mass',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  { 
    id: 'endurance', 
    title: 'Endurance',
    description: 'Improve stamina and endurance',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
  { 
    id: 'other', 
    title: 'Other',
    description: 'Specialized and unique workouts',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
];

export default function WorkoutCategoriesScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null);
  const [workouts, setWorkouts] = useState<PublicWorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      fetchWorkoutsByCategory();
    }
  }, [selectedCategory]);

  const fetchWorkoutsByCategory = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await WorkoutService.getPublicWorkoutPlans({
        category: selectedCategory!,
        limit: 20,
        offset: 0,
      });
      setWorkouts(response.workout_plans);
    } catch (error) {
      console.error('Error fetching workouts by category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workouts';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('User not authenticated, skipping fetch');
        setWorkouts([]);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (selectedCategory) {
      fetchWorkoutsByCategory(true);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleWorkoutPress = (workout: PublicWorkoutPlan) => {
    router.push(`/public-workouts?planId=${workout.id}`);
  };

  const renderCategoryCard = (categoryItem: typeof WORKOUT_CATEGORIES[0]) => (
    <TouchableOpacity 
      key={categoryItem.id} 
      style={[
        styles.categoryCard,
        selectedCategory === categoryItem.id && styles.selectedCategoryCard
      ]}
      onPress={() => handleCategorySelect(categoryItem.id)}
    >
      <Image source={{ uri: categoryItem.image }} style={styles.categoryImage} />
      <View style={styles.categoryOverlay}>
        <View style={styles.categoryContent}>
          <Text style={styles.categoryTitle}>{categoryItem.title}</Text>
          <Text style={styles.categoryDescription}>{categoryItem.description}</Text>
          {selectedCategory === categoryItem.id && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderWorkoutCard = (workout: PublicWorkoutPlan) => (
    <TouchableOpacity
      key={workout.id}
      style={styles.workoutCard}
      onPress={() => handleWorkoutPress(workout)}
    >
      <View style={styles.workoutContent}>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          {workout.description && (
            <Text style={styles.workoutDescription} numberOfLines={2}>
              {workout.description}
            </Text>
          )}
          <View style={styles.workoutStats}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {workout.daily_plans_count || 0} days
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {workout.total_calories} cal
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {workout.applications_count || 0} users
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.workoutAction}>
          <Ionicons name="chevron-forward" size={20} color="#A78BFA" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="barbell-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Workouts Found</Text>
      <Text style={styles.emptySubtitle}>
        No workouts available for this category yet. Check back later!
      </Text>
    </View>
  );

  const getSelectedCategoryTitle = () => {
    const category = WORKOUT_CATEGORIES.find(cat => cat.id === selectedCategory);
    return category ? category.title : 'All Categories';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedCategory ? getSelectedCategoryTitle() : 'Workout Categories'}
        </Text>
        {selectedCategory && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#A78BFA"
          />
        }
      >
        {selectedCategory ? (
          // Show workouts for selected category
          <View style={styles.workoutsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A78BFA" />
                <Text style={styles.loadingText}>Loading workouts...</Text>
              </View>
            ) : workouts.length > 0 ? (
              <View style={styles.workoutsList}>
                {workouts.map(renderWorkoutCard)}
              </View>
            ) : (
              renderEmptyState()
            )}
          </View>
        ) : (
          // Show all categories
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>Choose a Category</Text>
            <View style={styles.categoriesGrid}>
              {WORKOUT_CATEGORIES.map(renderCategoryCard)}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
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
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCategoryCard: {
    borderColor: '#A78BFA',
    borderWidth: 2,
  },
  categoryImage: {
    width: '100%',
    height: 120,
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#fff',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  workoutsContainer: {
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  workoutsList: {
    gap: 12,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  workoutStats: {
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
    color: '#666',
  },
  workoutAction: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 