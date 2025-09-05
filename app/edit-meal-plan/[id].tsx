import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MealService, MealPlan } from '../services/mealService';
import { updateMealPlan } from '../services/mealPlanManagementService';

export default function EditMealPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<string>('general_health');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'background');

  useEffect(() => {
    if (id) {
      loadMealPlan();
    }
  }, [id]);

  const loadMealPlan = async () => {
    try {
      setLoading(true);
      const response = await MealService.getMealPlan(id);
      const plan = response.meal_plan;
      setMealPlan(plan);
      setTitle(plan.title);
      setDescription(plan.description);
      setGoal(plan.goal);
    } catch (error) {
      console.error('Error loading meal plan:', error);
      Alert.alert('Error', 'Failed to load meal plan details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!mealPlan) return;

    try {
      setSaving(true);
      await updateMealPlan(mealPlan.id, {
        title,
        description,
        goal: goal as any,
      });
      Alert.alert('Success', 'Meal plan updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating meal plan:', error);
      Alert.alert('Error', 'Failed to update meal plan');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!mealPlan) return;

    try {
      setSaving(true);
      await updateMealPlan(mealPlan.id, {
        title,
        description,
        goal: goal as any,
        status: 'published',
      });
      Alert.alert('Success', 'Meal plan published successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error publishing meal plan:', error);
      Alert.alert('Error', 'Failed to publish meal plan');
    } finally {
      setSaving(false);
    }
  };

  const goalOptions = [
    { value: 'general_health', label: 'General Health' },
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'weight_gain', label: 'Weight Gain' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'athletic_performance', label: 'Athletic Performance' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Loading meal plan...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!mealPlan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={textColor + '60'} />
          <ThemedText style={styles.errorText}>Meal plan not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Edit Meal Plan</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        <ThemedView style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="restaurant" size={24} color={primaryColor} />
            <ThemedText style={styles.cardTitle}>Basic Information</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Title</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: backgroundColor,
                  color: textColor,
                  borderColor: textColor + '20',
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter meal plan title"
              placeholderTextColor={textColor + '60'}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: backgroundColor,
                  color: textColor,
                  borderColor: textColor + '20',
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter meal plan description"
              placeholderTextColor={textColor + '60'}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Goal</ThemedText>
            <View style={styles.goalOptions}>
              {goalOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.goalOption,
                    {
                      backgroundColor: goal === option.value ? primaryColor : backgroundColor,
                      borderColor: textColor + '20',
                    },
                  ]}
                  onPress={() => setGoal(option.value)}
                >
                  <ThemedText
                    style={[
                      styles.goalOptionText,
                      {
                        color: goal === option.value ? 'white' : textColor,
                      },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ThemedView>

        {/* AI Generated Info */}
        {mealPlan.is_ai_generated && (
          <ThemedView style={[styles.card, { backgroundColor: cardBackground }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="sparkles" size={24} color="#FF6B6B" />
              <ThemedText style={styles.cardTitle}>AI Generated Plan</ThemedText>
            </View>
            <ThemedText style={styles.aiInfo}>
              This meal plan was generated by AI. You can edit the basic information above and publish it when ready.
            </ThemedText>
          </ThemedView>
        )}

        {/* Nutrition Summary */}
        <ThemedView style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="nutrition" size={24} color={primaryColor} />
            <ThemedText style={styles.cardTitle}>Nutrition Summary</ThemedText>
          </View>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionValue}>{mealPlan.total_calories}</ThemedText>
              <ThemedText style={styles.nutritionLabel}>Calories</ThemedText>
            </View>
            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionValue}>{Math.round(mealPlan.total_protein)}g</ThemedText>
              <ThemedText style={styles.nutritionLabel}>Protein</ThemedText>
            </View>
            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionValue}>{Math.round(mealPlan.total_carbs)}g</ThemedText>
              <ThemedText style={styles.nutritionLabel}>Carbs</ThemedText>
            </View>
            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionValue}>{Math.round(mealPlan.total_fat)}g</ThemedText>
              <ThemedText style={styles.nutritionLabel}>Fat</ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <LoadingSpinner size="small" color="white" />
          ) : (
            <Ionicons name="save-outline" size={20} color="white" />
          )}
          <ThemedText style={styles.actionButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </ThemedText>
        </TouchableOpacity>

        {mealPlan.status === 'draft' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.publishButton]}
            onPress={handlePublish}
            disabled={saving}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>Publish Plan</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerRight: {
    minWidth: 40,
  },
  scrollView: {
    flex: 1,
    padding: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    opacity: 0.7,
  },
  card: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  goalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  goalOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  aiInfo: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  publishButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});