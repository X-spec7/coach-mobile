import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WorkoutService, WorkoutPlan, PublicWorkoutPlan } from '../services/workoutService';
import { CreateWorkoutPlanModal } from '../modals/CreateWorkoutPlanModal';
import { WorkoutPlanDetailsModal } from '../modals/WorkoutPlanDetailsModal';

// Workout categories with backend integration
const workoutCategories = [
  {
    id: 'strength',
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
    id: 'yoga',
    title: 'Yoga & Flexibility',
    description: 'Enhance flexibility and mindfulness',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
  },
  {
    id: 'hiit',
    title: 'HIIT',
    description: 'High-intensity interval training',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  },
];

export default function WorkoutsScreen() {
  console.log('WorkoutsScreen rendering...');
  
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [publicWorkouts, setPublicWorkouts] = useState<PublicWorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkoutPlans();
    fetchPublicWorkouts();
  }, []);

  const fetchWorkoutPlans = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await WorkoutService.getWorkoutPlans();
      setWorkoutPlans(response.workout_plans);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workout plans';
      
      // Don't show alert for authentication required errors - user might not be logged in yet
      if (errorMessage.includes('Authentication required')) {
        console.log('User not authenticated, skipping workout plans fetch');
        setWorkoutPlans([]); // Clear any existing plans
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPublicWorkouts = async () => {
    setPublicLoading(true);
    try {
      const response = await WorkoutService.getPublicWorkoutPlans({
        limit: 10,
        offset: 0,
      });
      setPublicWorkouts(response.workout_plans);
    } catch (error) {
      console.error('Error fetching public workouts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load public workouts';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('User not authenticated, skipping public workouts fetch');
        setPublicWorkouts([]);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setPublicLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWorkoutPlans(true);
    fetchPublicWorkouts();
  };

  const handlePlanPress = (planId: string) => {
    setSelectedPlanId(planId);
    setShowDetailsModal(true);
  };

  const handleDeletePlan = async (planId: string, planTitle: string) => {
    Alert.alert(
      'Delete Workout Plan',
      `Are you sure you want to delete "${planTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await WorkoutService.deleteWorkoutPlan(planId);
              await fetchWorkoutPlans();
            } catch (error) {
              console.error('Error deleting workout plan:', error);
              Alert.alert('Error', 'Failed to delete workout plan');
            }
          },
        },
      ]
    );
  };

  const renderWorkoutPlan = (plan: WorkoutPlan) => (
    <TouchableOpacity
      key={plan.id}
      style={styles.planCard}
      onPress={() => handlePlanPress(plan.id)}
    >
      <View style={styles.planContent}>
        <View style={styles.planInfo}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: plan.status === 'published' ? '#4CAF50' : '#FFA726' }
            ]}>
              <Text style={styles.statusText}>{plan.status_display}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeletePlan(plan.id, plan.title);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
          {plan.description && (
            <Text style={styles.planDescription} numberOfLines={2}>
              {plan.description}
            </Text>
          )}
          <View style={styles.planStats}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {plan.daily_plans_count || 0} days
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {plan.total_calories} cal
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPublicWorkout = (workout: PublicWorkoutPlan) => (
    <TouchableOpacity
      key={workout.id}
      style={styles.publicWorkoutCard}
      onPress={() => router.push(`/public-workouts?planId=${workout.id}`)}
    >
      <View style={styles.publicWorkoutContent}>
        <View style={styles.publicWorkoutInfo}>
          <Text style={styles.publicWorkoutTitle}>{workout.title}</Text>
          {workout.description && (
            <Text style={styles.publicWorkoutDescription} numberOfLines={2}>
              {workout.description}
            </Text>
          )}
          <View style={styles.publicWorkoutStats}>
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
        <View style={styles.publicWorkoutAction}>
          <Ionicons name="chevron-forward" size={20} color="#A78BFA" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyWorkoutPlans = () => (
    <View style={styles.emptyState}>
      <Ionicons name="barbell-outline" size={48} color="#666" />
      <Text style={styles.emptyStateTitle}>No Workout Plans Yet</Text>
      <Text style={styles.emptyStateText}>
        Create your first workout plan to get started
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.emptyStateButtonText}>Create Your First Plan</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategoryCard = (category: typeof workoutCategories[0]) => (
    <TouchableOpacity 
      key={category.id} 
      style={styles.categoryCard}
      onPress={() => router.push(`/public-workouts?category=${category.id}`)}
    >
      <Image source={{ uri: category.image }} style={styles.categoryImage} />
      <View style={styles.categoryOverlay}>
        <View style={styles.categoryContent}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
          <View style={styles.categoryAction}>
            <Text style={styles.categoryActionText}>Explore</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
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
        <Text style={styles.title}>Workouts & Plans</Text>
        
        {/* My Workout Plans Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Workout Plans</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#A78BFA" />
              <Text style={styles.addButtonText}>Create Plan</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text style={styles.loadingText}>Loading workout plans...</Text>
            </View>
          ) : workoutPlans.length > 0 ? (
            <>
              <View style={styles.plansContainer}>
                {workoutPlans.slice(0, 3).map(renderWorkoutPlan)}
              </View>
              {workoutPlans.length > 3 && (
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => router.push('/my-workouts')}
                >
                  <Text style={styles.viewMoreText}>View All {workoutPlans.length} Plans</Text>
                  <Ionicons name="chevron-forward" size={16} color="#A78BFA" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            renderEmptyWorkoutPlans()
          )}
        </View>

        {/* Public Workouts Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Public Workouts</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/public-workouts')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#A78BFA" />
            </TouchableOpacity>
          </View>

          {publicLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text style={styles.loadingText}>Loading public workouts...</Text>
            </View>
          ) : publicWorkouts.length > 0 ? (
            <View style={styles.publicWorkoutsContainer}>
              {publicWorkouts.slice(0, 3).map(renderPublicWorkout)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="globe-outline" size={48} color="#666" />
              <Text style={styles.emptyStateTitle}>No Public Workouts</Text>
              <Text style={styles.emptyStateText}>
                Check back later for community workout plans
              </Text>
            </View>
          )}
        </View>

        {/* Workout Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Workout Categories</Text>
          <View style={styles.categoriesContainer}>
            {workoutCategories.map(renderCategoryCard)}
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <CreateWorkoutPlanModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchWorkoutPlans}
      />

      <WorkoutPlanDetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        workoutPlanId={selectedPlanId}
        onUpdate={fetchWorkoutPlans}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 20,
    marginTop: 40,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
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
    color: '#1a1a1a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#A78BFA',
    marginLeft: 4,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewAllText: {
    color: '#A78BFA',
    marginRight: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
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
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  planStats: {
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
  deleteButton: {
    padding: 8,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewMoreText: {
    color: '#A78BFA',
    fontWeight: '600',
    marginRight: 4,
  },
  publicWorkoutCard: {
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
  publicWorkoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  publicWorkoutInfo: {
    flex: 1,
  },
  publicWorkoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  publicWorkoutDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  publicWorkoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  publicWorkoutAction: {
    padding: 8,
  },
  publicWorkoutsContainer: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoriesContainer: {
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
    marginBottom: 12,
  },
  categoryImage: {
    width: '100%',
    height: 160,
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 16,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
  },
  categoryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryActionText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 4,
  },
});