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
import { router, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  getFoodEntryDetails,
  updateFoodEntry,
  deleteFoodEntry,
  FoodEntry,
  MealType,
  ConsumptionUnit,
} from '../services/calorieTrackingService';

export default function EditFoodEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [foodEntry, setFoodEntry] = useState<FoodEntry | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    unit: 'gram' as ConsumptionUnit,
    meal_type: 'lunch' as MealType,
    notes: '',
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'background');
  const inputBackground = useThemeColor({}, 'background');

  const units: ConsumptionUnit[] = [
    'gram', 'ml', 'piece', 'cup', 'tbsp', 'tsp', 'slice', 'medium', 'large', 'small'
  ];

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

  useEffect(() => {
    if (id) {
      loadFoodEntry();
    }
  }, [id]);

  const loadFoodEntry = async () => {
    try {
      setLoading(true);
      const response = await getFoodEntryDetails(id);
      const entry = response.food_entry;
      setFoodEntry(entry);
      setFormData({
        amount: entry.amount.toString(),
        unit: entry.unit as ConsumptionUnit,
        meal_type: entry.meal_type,
        notes: entry.notes || '',
      });
    } catch (error) {
      console.error('Error loading food entry:', error);
      Alert.alert('Error', 'Failed to load food entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!foodEntry) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setSaving(true);
      await updateFoodEntry(foodEntry.id, {
        amount,
        unit: formData.unit,
        meal_type: formData.meal_type,
        notes: formData.notes.trim() || undefined,
      });

      Alert.alert('Success', 'Food entry updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error updating food entry:', error);
      Alert.alert('Error', 'Failed to update food entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Food Entry',
      'Are you sure you want to delete this food entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ]
    );
  };

  const performDelete = async () => {
    if (!foodEntry) return;

    try {
      setDeleting(true);
      await deleteFoodEntry(foodEntry.id);
      Alert.alert('Success', 'Food entry deleted successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error deleting food entry:', error);
      Alert.alert('Error', 'Failed to delete food entry');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!foodEntry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={textColor + '40'} />
          <ThemedText style={styles.errorTitle}>Food Entry Not Found</ThemedText>
          <ThemedText style={styles.errorDescription}>
            The food entry you're looking for doesn't exist or has been deleted.
          </ThemedText>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: primaryColor }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText style={styles.title}>Edit Food Entry</ThemedText>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: '#FF4444' }]}
              onPress={handleDelete}
              disabled={deleting}
            >
              <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Food Details */}
          <ThemedView style={[styles.foodDetailsCard, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles.foodName}>{foodEntry.food_item_details.name}</ThemedText>
            <View style={styles.foodNutrition}>
              <View style={styles.nutritionItem}>
                <ThemedText style={styles.nutritionValue}>{foodEntry.calories}</ThemedText>
                <ThemedText style={styles.nutritionLabel}>calories</ThemedText>
              </View>
              <View style={styles.nutritionItem}>
                <ThemedText style={styles.nutritionValue}>{foodEntry.protein}g</ThemedText>
                <ThemedText style={styles.nutritionLabel}>protein</ThemedText>
              </View>
              <View style={styles.nutritionItem}>
                <ThemedText style={styles.nutritionValue}>{foodEntry.carbs}g</ThemedText>
                <ThemedText style={styles.nutritionLabel}>carbs</ThemedText>
              </View>
              <View style={styles.nutritionItem}>
                <ThemedText style={styles.nutritionValue}>{foodEntry.fat}g</ThemedText>
                <ThemedText style={styles.nutritionLabel}>fat</ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* Edit Form */}
          <ThemedView style={[styles.formCard, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles.sectionTitle}>Edit Entry</ThemedText>

            {/* Amount and Unit */}
            <View style={styles.amountSection}>
              <ThemedText style={styles.inputLabel}>Amount</ThemedText>
              <View style={styles.amountRow}>
                <TextInput
                  style={[
                    styles.amountInput,
                    {
                      backgroundColor: inputBackground,
                      color: textColor,
                      borderColor: textColor + '20',
                    },
                  ]}
                  value={formData.amount}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                  placeholder="100"
                  placeholderTextColor={textColor + '60'}
                  keyboardType="numeric"
                />
                <View style={styles.unitPicker}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {units.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.unitButton,
                          {
                            backgroundColor: formData.unit === unit ? primaryColor : inputBackground,
                            borderColor: textColor + '20',
                          },
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, unit }))}
                      >
                        <ThemedText
                          style={[
                            styles.unitButtonText,
                            { color: formData.unit === unit ? 'white' : textColor },
                          ]}
                        >
                          {unit}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Meal Type */}
            <View style={styles.mealTypeSection}>
              <ThemedText style={styles.inputLabel}>Meal Type</ThemedText>
              <View style={styles.mealTypeButtons}>
                {mealTypes.map((mealType) => (
                  <TouchableOpacity
                    key={mealType}
                    style={[
                      styles.mealTypeButton,
                      {
                        backgroundColor: formData.meal_type === mealType ? primaryColor : inputBackground,
                        borderColor: textColor + '20',
                      },
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, meal_type: mealType }))}
                  >
                    <ThemedText
                      style={[
                        styles.mealTypeButtonText,
                        { color: formData.meal_type === mealType ? 'white' : textColor },
                      ]}
                    >
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.notesSection}>
              <ThemedText style={styles.inputLabel}>Notes (Optional)</ThemedText>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: inputBackground,
                    color: textColor,
                    borderColor: textColor + '20',
                  },
                ]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Add notes about this food..."
                placeholderTextColor={textColor + '60'}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: primaryColor }]}
              onPress={handleSave}
              disabled={saving}
            >
              <ThemedText style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </ThemedText>
            </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  foodDetailsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foodName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  foodNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nutritionLabel: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  amountSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  unitPicker: {
    flex: 1,
  },
  unitButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mealTypeSection: {
    marginBottom: 20,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mealTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 