import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import { UserProfileService } from './services/userProfileService';
import { 
  getUserGoals, 
  getAvailableGoals, 
  addGoal, 
  updateGoal, 
  removeGoal, 
  toggleGoal,
  Goal, 
  UserGoal, 
  AddGoalRequest 
} from './services/goalService';

const GOAL_OPTIONS = [
  { id: 'weight_loss', title: 'Lose Weight', icon: 'scale' },
  { id: 'muscle_gain', title: 'Build Muscle', icon: 'fitness' },
  { id: 'fitness', title: 'Improve Fitness', icon: 'flash' },
  { id: 'strength', title: 'Increase Strength', icon: 'barbell' },
  { id: 'endurance', title: 'Build Endurance', icon: 'timer' },
  { id: 'flexibility', title: 'Improve Flexibility', icon: 'body' },
  { id: 'stress_reduction', title: 'Reduce Stress', icon: 'leaf' },
  { id: 'better_sleep', title: 'Better Sleep', icon: 'moon' },
];

export default function GoalsScreen() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Array<Goal & { user_goal?: UserGoal }>>([]);
  const [availableGoals, setAvailableGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [userGoalsResponse, availableGoalsResponse] = await Promise.all([
        getUserGoals(),
        getAvailableGoals(),
      ]);
      
      console.log('User goals response:', userGoalsResponse);
      console.log('Available goals response:', availableGoalsResponse);
      
      // The API returns goals with user_goal nested, so we need to handle this properly
      const goalsWithUserGoals = userGoalsResponse.goals.map(goal => ({
        ...goal,
        user_goal: goal.user_goal || undefined
      }));
      
      console.log('Processed goals with user_goals:', goalsWithUserGoals);
      
      setGoals(goalsWithUserGoals);
      setAvailableGoals(availableGoalsResponse.available_goals);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGoal = async (userGoalId: number, isActive: boolean) => {
    try {
      setSaving(true);
      await toggleGoal(userGoalId, !isActive);
      
      // Refresh the goals list to get the updated data from the server
      await fetchGoals();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to toggle goal');
    } finally {
      setSaving(false);
    }
  };

  const handleAddGoal = async (goalId: string) => {
    try {
      setSaving(true);
      console.log('Adding goal with ID:', goalId);
      const response = await addGoal({ goal_id: goalId });
      console.log('Add goal response:', response);
      
      // Refresh the goals list to get the updated data from the server
      await fetchGoals();
      
      Alert.alert('Success', 'Goal added successfully!');
    } catch (err) {
      console.error('Error adding goal:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add goal');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveGoal = (userGoalId: number) => {
    Alert.alert(
      'Remove Goal',
      'Are you sure you want to remove this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await removeGoal(userGoalId);
              
              // Refresh the goals list to get the updated data from the server
              await fetchGoals();
              
              Alert.alert('Success', 'Goal removed successfully!');
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to remove goal');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Goals are automatically saved when individual actions are performed
      // This function can be used for any bulk operations if needed
      Alert.alert('Success', 'Goals are automatically saved!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goals');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update goals');
    } finally {
      setSaving(false);
    }
  };

  const renderGoalCard = (goal: Goal & { user_goal?: UserGoal }) => (
    <View key={goal.id} style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalIcon}>
          <Ionicons name={goal.icon as any} size={24} color="#A26FFD" />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          {goal.user_goal?.target_value && goal.user_goal?.current_value && (
            <Text style={styles.goalProgress}>
              {goal.user_goal.current_value} / {goal.user_goal.target_value} {goal.user_goal.unit}
            </Text>
          )}
          {goal.user_goal?.progress_percentage !== undefined && (
            <Text style={styles.progressPercentage}>
              {goal.user_goal.progress_percentage.toFixed(1)}% complete
            </Text>
          )}
        </View>
        <View style={styles.goalActions}>
          <TouchableOpacity
            style={[styles.toggleButton, goal.user_goal?.is_active && styles.toggleButtonActive]}
            onPress={() => goal.user_goal && handleToggleGoal(goal.user_goal.id, goal.user_goal.is_active)}
            disabled={saving}
          >
            <Ionicons 
              name={goal.user_goal?.is_active ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={goal.user_goal?.is_active ? "#A26FFD" : "#ccc"} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => goal.user_goal && handleRemoveGoal(goal.user_goal.id)}
            disabled={saving}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderGoalOption = (goal: Goal) => {
    const isSelected = goals.some(userGoal => userGoal.id === goal.id && userGoal.user_goal);
    
    return (
      <TouchableOpacity
        key={goal.id}
        style={[styles.goalOption, isSelected && styles.goalOptionSelected]}
        onPress={() => !isSelected && handleAddGoal(goal.id)}
        disabled={isSelected || saving}
      >
        <Ionicons 
          name={goal.icon as any} 
          size={24} 
          color={isSelected ? "#fff" : "#A26FFD"} 
        />
        <Text style={[styles.goalOptionText, isSelected && styles.goalOptionTextSelected]}>
          {goal.title}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A26FFD" />
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchGoals} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Goals</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#A26FFD" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Goals</Text>
          {(() => {
            const userGoals = goals.filter(goal => goal.user_goal);
            console.log('Goals with user_goal:', userGoals);
            console.log('Total goals:', goals.length);
            
            return userGoals.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="flag" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No goals set yet</Text>
                <Text style={styles.emptyStateSubtext}>Add some goals to track your progress</Text>
              </View>
            ) : (
              <View style={styles.goalsList}>
                {userGoals.map(renderGoalCard)}
              </View>
            );
          })()}
        </View>

        {/* Add New Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Goals</Text>
          <View style={styles.goalOptionsGrid}>
            {availableGoals.map(renderGoalOption)}
          </View>
        </View>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#A26FFD20',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#A26FFD',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#A26FFD',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  goalsList: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A26FFD20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  goalProgress: {
    fontSize: 14,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#A26FFD',
    fontWeight: '600',
    marginTop: 2,
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleButton: {
    padding: 4,
  },
  toggleButtonActive: {
    // Active state styling
  },
  removeButton: {
    padding: 4,
  },
  goalOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    minWidth: '45%',
  },
  goalOptionSelected: {
    backgroundColor: '#A26FFD',
  },
  goalOptionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  goalOptionTextSelected: {
    color: '#fff',
  },
}); 