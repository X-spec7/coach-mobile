import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { 
  MealTrackingService, 
  ScheduledMealDetails, 
  ConsumedFood, 
  ConsumptionUnit,
  LogFoodRequest,
  UpdateConsumedFoodRequest,
  PlannedFoodItem
} from '../services/mealTrackingService';

const CONSUMPTION_UNITS: { value: ConsumptionUnit; label: string }[] = [
  { value: 'gram', label: 'grams' },
  { value: 'ml', label: 'ml' },
  { value: 'piece', label: 'pieces' },
  { value: 'cup', label: 'cups' },
  { value: 'tbsp', label: 'tbsp' },
  { value: 'tsp', label: 'tsp' },
];

export default function MealDetailScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const { user } = useAuth();
  const [mealDetails, setMealDetails] = useState<ScheduledMealDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Planned food items state - now comes from API
  const [plannedFoodItems, setPlannedFoodItems] = useState<PlannedFoodItem[]>([]);
  
  // Modal states
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<any>(null);
  const [selectedConsumedFood, setSelectedConsumedFood] = useState<ConsumedFood | null>(null);
  
  // Form states
  const [consumedAmount, setConsumedAmount] = useState('');
  const [consumedUnit, setConsumedUnit] = useState<ConsumptionUnit>('gram');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mealId) {
      fetchMealDetails();
    }
  }, [mealId]);

  const fetchMealDetails = async (isRefresh = false) => {
    if (!mealId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await MealTrackingService.getScheduledMealDetails(mealId);
      setMealDetails(response.scheduled_meal);
      
      // Use planned_foods from the API response
      if (response.scheduled_meal.planned_foods) {
        setPlannedFoodItems(response.scheduled_meal.planned_foods);
      }
    } catch (error) {
      console.error('Error fetching meal details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load meal details';
      
      if (!errorMessage.includes('Authentication required')) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchMealDetails(true);
  };

  const handleLogFood = (foodItem: PlannedFoodItem) => {
    setSelectedFoodItem(foodItem);
    // Pre-fill with planned amount as default
    setConsumedAmount(foodItem.amount.toString());
    setConsumedUnit((foodItem.unit || 'gram') as ConsumptionUnit);
    setNotes('');
    setShowLogModal(true);
  };

  const handleEditConsumed = (consumedFood: ConsumedFood) => {
    setSelectedConsumedFood(consumedFood);
    setConsumedAmount(consumedFood.consumed_amount.toString());
    setConsumedUnit(consumedFood.consumed_unit);
    setNotes(consumedFood.notes || '');
    setShowEditModal(true);
  };

  const submitLogFood = async () => {
    if (!selectedFoodItem || !mealId) return;

    const amount = parseFloat(consumedAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const logData: LogFoodRequest = {
        meal_plan_food_item_id: selectedFoodItem.id,
        consumed_amount: amount,
        consumed_unit: consumedUnit,
        notes: notes.trim() || undefined,
      };

      await MealTrackingService.logFoodConsumption(mealId, logData);
      setShowLogModal(false);
      await fetchMealDetails();
      Alert.alert('Success', 'Food consumption logged successfully!');
    } catch (error) {
      console.error('Error logging food:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to log food consumption';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const submitUpdateConsumed = async () => {
    if (!selectedConsumedFood) return;

    const amount = parseFloat(consumedAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const updateData: UpdateConsumedFoodRequest = {
        consumed_amount: amount,
        consumed_unit: consumedUnit,
        notes: notes.trim() || undefined,
      };

      await MealTrackingService.updateConsumedFood(selectedConsumedFood.id, updateData);
      setShowEditModal(false);
      await fetchMealDetails();
      Alert.alert('Success', 'Food consumption updated successfully!');
    } catch (error) {
      console.error('Error updating consumed food:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update food consumption';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConsumed = async (consumedFood: ConsumedFood) => {
    Alert.alert(
      'Delete Food Log',
      `Remove ${consumedFood.food_item_details.name} from your log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await MealTrackingService.deleteConsumedFood(consumedFood.id);
              await fetchMealDetails();
              Alert.alert('Success', 'Food log deleted successfully!');
            } catch (error) {
              console.error('Error deleting consumed food:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to delete food log';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  // Helper functions for planned food items
  const isFoodItemCompleted = (foodItemId: string) => {
    const consumedFood = getConsumedFoodForPlannedItem(foodItemId);
    const plannedFoodItem = plannedFoodItems.find(pf => pf.id === foodItemId);
    
    if (!consumedFood || !plannedFoodItem) return false;
    
    // Check if the consumed amount equals or exceeds the planned amount
    return consumedFood.consumed_amount >= plannedFoodItem.amount;
  };

  const getConsumedFoodForPlannedItem = (foodItemId: string) => {
    return mealDetails?.consumed_foods.find(cf => cf.meal_plan_food_item === foodItemId);
  };

  const handleQuickComplete = async (plannedFoodItem: PlannedFoodItem) => {
    const isCompleted = isFoodItemCompleted(plannedFoodItem.id);
    
    if (isCompleted) {
      // Remove consumption
      const consumedFood = getConsumedFoodForPlannedItem(plannedFoodItem.id);
      if (consumedFood) {
        await handleDeleteConsumed(consumedFood);
      }
    } else {
      // Log full planned amount as consumed
      setSubmitting(true);
      try {
        const logData: LogFoodRequest = {
          meal_plan_food_item_id: plannedFoodItem.id,
          consumed_amount: plannedFoodItem.amount,
          consumed_unit: (plannedFoodItem.unit || 'gram') as ConsumptionUnit,
          notes: undefined,
        };

        await MealTrackingService.logFoodConsumption(mealId!, logData);
        await fetchMealDetails();
        Alert.alert('Success', 'Food marked as completed!');
      } catch (error) {
        console.error('Error logging food:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to log food consumption';
        Alert.alert('Error', errorMessage);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const closeModal = () => {
    setShowLogModal(false);
    setShowEditModal(false);
    setSelectedFoodItem(null);
    setSelectedConsumedFood(null);
    setConsumedAmount('');
    setNotes('');
  };

  const getUnloggedFoodItems = () => {
    if (!mealDetails) return [];
    
    // This would require the planned food items from the meal plan
    // For now, we'll show a placeholder since the API response doesn't include planned foods
    return [];
  };

  const renderConsumedFood = (consumedFood: ConsumedFood) => (
    <View key={consumedFood.id} style={styles.foodItem}>
      <View style={styles.foodHeader}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{consumedFood.food_item_details.name}</Text>
          <Text style={styles.foodAmount}>
            {consumedFood.consumed_amount}{consumedFood.consumed_unit} 
            {consumedFood.planned_amount && (
              <Text style={styles.plannedAmount}>
                {' '}/ {consumedFood.planned_amount}{consumedFood.planned_unit} planned
              </Text>
            )}
          </Text>
          <Text style={styles.foodNutrition}>
            {Math.round(consumedFood.calories)} cal • P: {consumedFood.protein}g • C: {consumedFood.carbs}g • F: {consumedFood.fat}g
          </Text>
          {consumedFood.notes && (
            <Text style={styles.foodNotes}>Note: {consumedFood.notes}</Text>
          )}
        </View>
        <View style={styles.foodActions}>
          <View style={[
            styles.completionBadge,
            { backgroundColor: consumedFood.is_fully_consumed ? '#4CAF50' : '#FFA726' }
          ]}>
            <Text style={styles.completionText}>
              {Math.round(consumedFood.completion_percentage)}%
            </Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditConsumed(consumedFood)}
          >
            <Ionicons name="create-outline" size={16} color="#A78BFA" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteConsumed(consumedFood)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.foodProgressBar}>
        <View style={[
          styles.foodProgressFill,
          { 
            width: `${consumedFood.completion_percentage}%`,
            backgroundColor: consumedFood.is_fully_consumed ? '#4CAF50' : '#FFA726'
          }
        ]} />
      </View>
    </View>
  );

  const renderPlannedFoodItem = (plannedFoodItem: PlannedFoodItem) => {
    const consumedFood = getConsumedFoodForPlannedItem(plannedFoodItem.id);
    const isCompleted = isFoodItemCompleted(plannedFoodItem.id);
    
    // Calculate completion percentage for this specific food item
    let completionPercentage = 0;
    if (consumedFood) {
      // Use backend's completion_percentage if available, otherwise calculate locally
      if (consumedFood.completion_percentage !== undefined) {
        completionPercentage = consumedFood.completion_percentage;
      } else if (plannedFoodItem.amount > 0) {
        completionPercentage = (consumedFood.consumed_amount / plannedFoodItem.amount) * 100;
      }
    }
    
    return (
      <View key={plannedFoodItem.id} style={styles.plannedFoodItem}>
        <TouchableOpacity
          style={styles.completionCheckbox}
          onPress={() => handleQuickComplete(plannedFoodItem)}
          disabled={submitting}
        >
          <Ionicons 
            name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
            size={24} 
            color={isCompleted ? "#4CAF50" : "#ddd"} 
          />
        </TouchableOpacity>
        
        <View style={styles.plannedFoodInfo}>
          <Text style={[styles.plannedFoodName, isCompleted && styles.completedText]}>
            {plannedFoodItem.food_item_details.name}
          </Text>
          <Text style={[styles.plannedFoodAmount, isCompleted && styles.completedText]}>
            Planned: {plannedFoodItem.amount}{plannedFoodItem.unit} • {Math.round(plannedFoodItem.calories)} cal
          </Text>
          {consumedFood && (
            <Text style={styles.consumedAmount}>
              Consumed: {consumedFood.consumed_amount}{consumedFood.consumed_unit} 
              ({Math.round(completionPercentage)}%)
            </Text>
          )}
          <Text style={styles.plannedFoodNutritionInfo}>
            P: {plannedFoodItem.protein}g • C: {plannedFoodItem.carbs}g • F: {plannedFoodItem.fat}g
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.logButton}
          onPress={() => handleLogFood(plannedFoodItem)}
          disabled={submitting}
        >
          <Ionicons name="add-circle-outline" size={20} color="#A78BFA" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderLogModal = () => (
    <Modal
      visible={showLogModal}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Food Consumption</Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          {selectedFoodItem && (
            <View style={styles.modalContent}>
              <Text style={styles.selectedFoodName}>{selectedFoodItem.food_item_details?.name || 'Food Item'}</Text>
              <Text style={styles.plannedAmountText}>
                Planned: {selectedFoodItem.amount}{selectedFoodItem.unit}
              </Text>
              <Text style={styles.nutritionInfo}>
                {Math.round(selectedFoodItem.calories)} cal • P: {selectedFoodItem.protein}g • C: {selectedFoodItem.carbs}g • F: {selectedFoodItem.fat}g
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount Consumed</Text>
                <View style={styles.amountInput}>
                  <TextInput
                    style={styles.amountField}
                    value={consumedAmount}
                    onChangeText={setConsumedAmount}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <View style={styles.unitSelector}>
                    <Text style={styles.unitText}>{consumedUnit}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about this food..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                  disabled={submitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={submitLogFood}
                  disabled={submitting}
                >
                  <Text style={styles.submitButtonText}>
                    {submitting ? 'Logging...' : 'Log Food'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Food Consumption</Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          {selectedConsumedFood && (
            <View style={styles.modalContent}>
              <Text style={styles.selectedFoodName}>{selectedConsumedFood.food_item_details.name}</Text>
              <Text style={styles.plannedAmountText}>
                Planned: {selectedConsumedFood.planned_amount}{selectedConsumedFood.planned_unit}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount Consumed</Text>
                <View style={styles.amountInput}>
                  <TextInput
                    style={styles.amountField}
                    value={consumedAmount}
                    onChangeText={setConsumedAmount}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <View style={styles.unitSelector}>
                    <Text style={styles.unitText}>{consumedUnit}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about this food..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                  disabled={submitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={submitUpdateConsumed}
                  disabled={submitting}
                >
                  <Text style={styles.submitButtonText}>
                    {submitting ? 'Updating...' : 'Update'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  if (!mealId) {
    return (
      <View style={styles.container}>
        <Text>Invalid meal ID</Text>
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
        <Text style={styles.headerTitle}>
          {mealDetails ? mealDetails.meal_time_name : 'Meal Details'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Loading meal details...</Text>
        </View>
      ) : mealDetails ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Meal Info */}
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{mealDetails.meal_time_name}</Text>
            <Text style={styles.mealTime}>{formatTime(mealDetails.meal_time_time)}</Text>
            <Text style={styles.mealDate}>
              {new Date(mealDetails.scheduled_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            
                         <View style={styles.completionStatus}>
               <View style={styles.progressContainer}>
                 <View style={styles.progressBar}>
                   <View style={[
                     styles.progressFill,
                     { 
                       width: `${mealDetails.completion_percentage}%`,
                       backgroundColor: mealDetails.is_completed ? '#4CAF50' : '#FFA726'
                     }
                   ]} />
                 </View>
                 <Text style={styles.progressText}>
                   {Math.round(mealDetails.completion_percentage)}% Complete
                 </Text>
               </View>
             </View>
          </View>

          {/* Nutrition Summary */}
          <View style={styles.nutritionSummary}>
            <Text style={styles.sectionTitle}>Nutrition Summary</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {Math.round(mealDetails.consumed_calories)}/{Math.round(mealDetails.planned_nutrition.calories)}
                </Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {Math.round(mealDetails.consumed_nutrition.protein)}/{Math.round(mealDetails.planned_nutrition.protein)}
                </Text>
                <Text style={styles.nutritionLabel}>Protein (g)</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {Math.round(mealDetails.consumed_nutrition.carbs)}/{Math.round(mealDetails.planned_nutrition.carbs)}
                </Text>
                <Text style={styles.nutritionLabel}>Carbs (g)</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {Math.round(mealDetails.consumed_nutrition.fat)}/{Math.round(mealDetails.planned_nutrition.fat)}
                </Text>
                <Text style={styles.nutritionLabel}>Fat (g)</Text>
              </View>
            </View>
          </View>

                     {/* Planned Food Items */}
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Planned Foods</Text>
             {plannedFoodItems.length > 0 ? (
               <View style={styles.plannedFoodsList}>
                 {plannedFoodItems.map(renderPlannedFoodItem)}
               </View>
             ) : (
               <View style={styles.emptyState}>
                 <Text style={styles.emptyText}>No planned foods found</Text>
                 <Text style={styles.emptySubtext}>This meal has no planned food items</Text>
               </View>
             )}
           </View>

          {/* Consumed Foods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Logged Foods</Text>
            {mealDetails.consumed_foods.length > 0 ? (
              <View style={styles.foodsList}>
                {mealDetails.consumed_foods.map(renderConsumedFood)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No foods logged yet</Text>
                <Text style={styles.emptySubtext}>Start logging your food consumption</Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Meal not found</Text>
        </View>
      )}

      {renderLogModal()}
      {renderEditModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  mealInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  mealTime: {
    fontSize: 18,
    color: '#A78BFA',
    fontWeight: '600',
    marginBottom: 4,
  },
  mealDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  completionStatus: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    width: 200,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  nutritionSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A78BFA',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  foodsList: {
    gap: 12,
  },
  foodItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  foodAmount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  plannedAmount: {
    color: '#999',
  },
  foodNutrition: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  foodNotes: {
    fontSize: 12,
    color: '#A78BFA',
    fontStyle: 'italic',
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
  },
  foodProgressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  foodProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  selectedFoodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  plannedAmountText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  nutritionInfo: {
    fontSize: 12,
    color: '#A78BFA',
    marginBottom: 20,
  },
  plannedFoodNutritionInfo: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  amountField: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  unitSelector: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Planned food items styles
  plannedFoodsList: {
    gap: 12,
  },
  plannedFoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  completionCheckbox: {
    marginRight: 12,
  },
  plannedFoodInfo: {
    flex: 1,
  },
  plannedFoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  plannedFoodAmount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  consumedAmount: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  logButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
  },
});