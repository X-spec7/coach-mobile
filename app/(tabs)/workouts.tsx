import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutService, WorkoutPlan } from '../services/workoutService';
import { CreateWorkoutPlanModal } from '../modals/CreateWorkoutPlanModal';
import { WorkoutPlanDetailsModal } from '../modals/WorkoutPlanDetailsModal';

const workoutCategories = [
  {
    id: 1,
    title: 'Strength',
    workouts: 12,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
  },
  {
    id: 2,
    title: 'Cardio',
    workouts: 8,
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500',
  },
  {
    id: 3,
    title: 'Yoga',
    workouts: 6,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
  },
];

export default function WorkoutsScreen() {
  console.log('WorkoutsScreen rendering...');
  
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkoutPlans();
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

  const handleRefresh = () => {
    fetchWorkoutPlans(true);
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
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {new Date(plan.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
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

  const renderWorkoutPlansStats = () => {
    const totalPlans = workoutPlans.length;
    const publishedPlans = workoutPlans.filter(plan => plan.status === 'published').length;
    const totalCalories = workoutPlans.reduce((sum, plan) => sum + plan.total_calories, 0);

    return (
      <View style={styles.plansStatsContainer}>
        <View style={styles.planStatCard}>
          <Text style={styles.planStatValue}>{totalPlans}</Text>
          <Text style={styles.planStatLabel}>Total Plans</Text>
        </View>
        <View style={styles.planStatCard}>
          <Text style={styles.planStatValue}>{publishedPlans}</Text>
          <Text style={styles.planStatLabel}>Published</Text>
        </View>
        <View style={styles.planStatCard}>
          <Text style={styles.planStatValue}>{totalCalories}</Text>
          <Text style={styles.planStatLabel}>Total Calories</Text>
        </View>
      </View>
    );
  };
  
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
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>148</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1,850</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>

        {/* Workout Plans Section */}
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

          {workoutPlans.length > 0 && renderWorkoutPlansStats()}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text style={styles.loadingText}>Loading workout plans...</Text>
            </View>
          ) : workoutPlans.length > 0 ? (
            <View style={styles.plansContainer}>
              {workoutPlans.map(renderWorkoutPlan)}
            </View>
          ) : (
            renderEmptyWorkoutPlans()
          )}
        </View>

        <Text style={styles.sectionTitle}>Exercise Categories</Text>
        {workoutCategories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryCard}>
            <Image source={{ uri: category.image }} style={styles.categoryImage} />
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryWorkouts}>{category.workouts} workouts</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
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
  plansStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  planStatCard: {
    alignItems: 'center',
  },
  planStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  planStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  categoryCard: {
    margin: 20,
    marginVertical: 10,
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
  categoryImage: {
    width: '100%',
    height: 160,
  },
  categoryContent: {
    padding: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  categoryWorkouts: {
    fontSize: 14,
    color: '#666',
  },
});