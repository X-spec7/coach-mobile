import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  getCalorieGoals,
  createUpdateCalorieGoals,
  CalorieGoal,
  CreateGoalRequest,
} from './services/calorieTrackingService';

export default function CalorieGoalsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState<CalorieGoal | null>(null);
  const [formData, setFormData] = useState({
    daily_calories: '',
    daily_protein: '',
    daily_carbs: '',
    daily_fat: '',
    is_active: true,
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'background');
  const inputBackground = useThemeColor({}, 'background');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await getCalorieGoals();
      setGoals(response.goal);
      
      if (response.goal) {
        setFormData({
          daily_calories: response.goal.daily_calories.toString(),
          daily_protein: response.goal.daily_protein.toString(),
          daily_carbs: response.goal.daily_carbs.toString(),
          daily_fat: response.goal.daily_fat.toString(),
          is_active: response.goal.is_active,
        });
      }
    } catch (error) {
      console.error('Error loading calorie goals:', error);
      Alert.alert('Error', 'Failed to load calorie goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    const calories = parseInt(formData.daily_calories);
    const protein = parseFloat(formData.daily_protein) || 0;
    const carbs = parseFloat(formData.daily_carbs) || 0;
    const fat = parseFloat(formData.daily_fat) || 0;

    if (!calories || calories < 800 || calories > 5000) {
      Alert.alert('Invalid Input', 'Daily calories must be between 800 and 5000');
      return;
    }

    if (protein < 0 || carbs < 0 || fat < 0) {
      Alert.alert('Invalid Input', 'Macronutrient values cannot be negative');
      return;
    }

    try {
      setSaving(true);
      const response = await createUpdateCalorieGoals({
        daily_calories: calories,
        daily_protein: protein,
        daily_carbs: carbs,
        daily_fat: fat,
        is_active: formData.is_active,
      });

      setGoals(response.goal);
      Alert.alert('Success', 'Calorie goals updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving calorie goals:', error);
      Alert.alert('Error', 'Failed to save calorie goals');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = () => {
    setFormData(prev => ({ ...prev, is_active: !prev.is_active }));
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <LoadingSpinner />
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={styles.title}>Calorie Goals</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: primaryColor }]}
          onPress={handleSave}
          disabled={saving}
        >
          <ThemedText style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          {/* Current Goals Display */}
          {goals && (
            <ThemedView style={[styles.currentGoalsCard, { backgroundColor: cardBackground }]}>
              <ThemedText style={styles.currentGoalsTitle}>Current Goals</ThemedText>
              <View style={styles.currentGoalsGrid}>
                <View style={styles.currentGoalItem}>
                  <ThemedText style={styles.currentGoalValue}>
                    {goals.daily_calories}
                  </ThemedText>
                  <ThemedText style={styles.currentGoalLabel}>Calories</ThemedText>
                </View>
                <View style={styles.currentGoalItem}>
                  <ThemedText style={styles.currentGoalValue}>
                    {goals.daily_protein}g
                  </ThemedText>
                  <ThemedText style={styles.currentGoalLabel}>Protein</ThemedText>
                </View>
                <View style={styles.currentGoalItem}>
                  <ThemedText style={styles.currentGoalValue}>
                    {goals.daily_carbs}g
                  </ThemedText>
                  <ThemedText style={styles.currentGoalLabel}>Carbs</ThemedText>
                </View>
                <View style={styles.currentGoalItem}>
                  <ThemedText style={styles.currentGoalValue}>
                    {goals.daily_fat}g
                  </ThemedText>
                  <ThemedText style={styles.currentGoalLabel}>Fat</ThemedText>
                </View>
              </View>
            </ThemedView>
          )}

          {/* Goal Settings Form */}
          <ThemedView style={[styles.formCard, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles.formTitle}>Set Your Goals</ThemedText>
            
            {/* Daily Calories */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Daily Calories</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: inputBackground,
                    color: textColor,
                    borderColor: textColor + '20',
                  },
                ]}
                value={formData.daily_calories}
                onChangeText={(text) => setFormData(prev => ({ ...prev, daily_calories: text }))}
                placeholder="2000"
                placeholderTextColor={textColor + '60'}
                keyboardType="numeric"
                maxLength={4}
              />
              <ThemedText style={styles.inputHint}>
                Recommended: 800-5000 calories per day
              </ThemedText>
            </View>

            {/* Macronutrients */}
            <View style={styles.macrosSection}>
              <ThemedText style={styles.macrosTitle}>Macronutrients (Optional)</ThemedText>
              
              <View style={styles.macroInputs}>
                <View style={styles.macroInput}>
                  <ThemedText style={styles.inputLabel}>Protein (g)</ThemedText>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: inputBackground,
                        color: textColor,
                        borderColor: textColor + '20',
                      },
                    ]}
                    value={formData.daily_protein}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, daily_protein: text }))}
                    placeholder="150"
                    placeholderTextColor={textColor + '60'}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>

                <View style={styles.macroInput}>
                  <ThemedText style={styles.inputLabel}>Carbs (g)</ThemedText>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: inputBackground,
                        color: textColor,
                        borderColor: textColor + '20',
                      },
                    ]}
                    value={formData.daily_carbs}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, daily_carbs: text }))}
                    placeholder="200"
                    placeholderTextColor={textColor + '60'}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>

                <View style={styles.macroInput}>
                  <ThemedText style={styles.inputLabel}>Fat (g)</ThemedText>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: inputBackground,
                        color: textColor,
                        borderColor: textColor + '20',
                      },
                    ]}
                    value={formData.daily_fat}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, daily_fat: text }))}
                    placeholder="65"
                    placeholderTextColor={textColor + '60'}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
            </View>

            {/* Active Toggle */}
            <View style={styles.toggleSection}>
              <View style={styles.toggleInfo}>
                <ThemedText style={styles.toggleLabel}>Active Goals</ThemedText>
                <ThemedText style={styles.toggleDescription}>
                  Enable to start tracking against these goals
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor: formData.is_active ? primaryColor : textColor + '20',
                  },
                ]}
                onPress={toggleActive}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      transform: [{ translateX: formData.is_active ? 20 : 0 }],
                      backgroundColor: 'white',
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* Recommendations */}
          <ThemedView style={[styles.recommendationsCard, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles.recommendationsTitle}>Recommendations</ThemedText>
            <View style={styles.recommendationsList}>
              <View style={styles.recommendationItem}>
                <Ionicons name="information-circle" size={20} color={primaryColor} />
                <ThemedText style={styles.recommendationText}>
                  Start with a moderate calorie goal and adjust based on your progress
                </ThemedText>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="information-circle" size={20} color={primaryColor} />
                <ThemedText style={styles.recommendationText}>
                  Protein: 0.8-1.2g per pound of body weight for muscle building
                </ThemedText>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="information-circle" size={20} color={primaryColor} />
                <ThemedText style={styles.recommendationText}>
                  Carbs: 45-65% of total calories for energy
                </ThemedText>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="information-circle" size={20} color={primaryColor} />
                <ThemedText style={styles.recommendationText}>
                  Fat: 20-35% of total calories for hormone production
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56, // Ensure consistent header height
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  currentGoalsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentGoalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  currentGoalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentGoalItem: {
    alignItems: 'center',
    flex: 1,
  },
  currentGoalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentGoalLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  formCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputHint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  macrosSection: {
    marginBottom: 24,
  },
  macrosTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  macroInputs: {
    gap: 16,
  },
  macroInput: {
    flex: 1,
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  toggleButton: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  recommendationsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
}); 