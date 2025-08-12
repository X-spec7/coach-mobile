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

interface Goal {
  id: string;
  title: string;
  icon: string;
  isActive: boolean;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  createdAt: string;
}

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
  const [goals, setGoals] = useState<Goal[]>([]);
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
      
      // For now, we'll use mock data since the goals API isn't implemented yet
      // TODO: Replace with actual API call when backend is ready
      const mockGoals: Goal[] = [
        {
          id: '1',
          title: 'Lose Weight',
          icon: 'scale',
          isActive: true,
          targetValue: 70,
          currentValue: 75,
          unit: 'kg',
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Build Muscle',
          icon: 'fitness',
          isActive: true,
          targetValue: 80,
          currentValue: 75,
          unit: 'kg',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];
      
      setGoals(mockGoals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goalId: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, isActive: !goal.isActive }
          : goal
      )
    );
  };

  const addGoal = (goalOption: typeof GOAL_OPTIONS[0]) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goalOption.title,
      icon: goalOption.icon,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const removeGoal = (goalId: string) => {
    Alert.alert(
      'Remove Goal',
      'Are you sure you want to remove this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setGoals(prev => prev.filter(goal => goal.id !== goalId));
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // TODO: Implement API call to save goals
      // await UserProfileService.updateGoals(goals);
      
      Alert.alert('Success', 'Goals updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goals');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update goals');
    } finally {
      setSaving(false);
    }
  };

  const renderGoalCard = (goal: Goal) => (
    <View key={goal.id} style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalIcon}>
          <Ionicons name={goal.icon as any} size={24} color="#A26FFD" />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          {goal.targetValue && goal.currentValue && (
            <Text style={styles.goalProgress}>
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </Text>
          )}
        </View>
        <View style={styles.goalActions}>
          <TouchableOpacity
            style={[styles.toggleButton, goal.isActive && styles.toggleButtonActive]}
            onPress={() => toggleGoal(goal.id)}
          >
            <Ionicons 
              name={goal.isActive ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={goal.isActive ? "#A26FFD" : "#ccc"} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeGoal(goal.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderGoalOption = (goalOption: typeof GOAL_OPTIONS[0]) => {
    const isSelected = goals.some(goal => goal.title === goalOption.title);
    
    return (
      <TouchableOpacity
        key={goalOption.id}
        style={[styles.goalOption, isSelected && styles.goalOptionSelected]}
        onPress={() => !isSelected && addGoal(goalOption)}
        disabled={isSelected}
      >
        <Ionicons 
          name={goalOption.icon as any} 
          size={24} 
          color={isSelected ? "#fff" : "#A26FFD"} 
        />
        <Text style={[styles.goalOptionText, isSelected && styles.goalOptionTextSelected]}>
          {goalOption.title}
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
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="target" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No goals set yet</Text>
              <Text style={styles.emptyStateSubtext}>Add some goals to track your progress</Text>
            </View>
          ) : (
            <View style={styles.goalsList}>
              {goals.map(renderGoalCard)}
            </View>
          )}
        </View>

        {/* Add New Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Goals</Text>
          <View style={styles.goalOptionsGrid}>
            {GOAL_OPTIONS.map(renderGoalOption)}
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