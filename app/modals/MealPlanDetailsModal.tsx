import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealService, MealPlan, DailyPlan, MealTime, MealPlanFoodItem, FoodItem, MealPlanGoal } from '../services/mealService';
import { useAuth } from '../contexts/AuthContext';

interface MealPlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  plan: { mealPlan: MealPlan | null };
  onChoose?: (plan: MealPlan) => void;
  onAssign?: (plan: MealPlan) => void;
  onDelete?: () => void;
}

const DAY_OPTIONS = [
  { key: 'day1', label: 'Day 1' },
  { key: 'day2', label: 'Day 2' },
  { key: 'day3', label: 'Day 3' },
  { key: 'day4', label: 'Day 4' },
  { key: 'day5', label: 'Day 5' },
  { key: 'day6', label: 'Day 6' },
  { key: 'day7', label: 'Day 7' },
];

const MEAL_TIME_TEMPLATES = [
  { name: 'Breakfast', time: '08:00:00' },
  { name: 'Morning Snack', time: '10:30:00' },
  { name: 'Lunch', time: '12:30:00' },
  { name: 'Afternoon Snack', time: '15:30:00' },
  { name: 'Dinner', time: '18:30:00' },
  { name: 'Evening Snack', time: '21:00:00' },
];

export const MealPlanDetailsModal: React.FC<MealPlanDetailsModalProps> = ({
  visible,
  onClose,
  plan,
  onChoose,
  onAssign,
  onDelete,
}) => {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showAddMealTimeModal, setShowAddMealTimeModal] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedMealTimeId, setSelectedMealTimeId] = useState<string | null>(null);
  
  // Food selection states
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [foodAmount, setFoodAmount] = useState('100');
  const [foodUnit, setFoodUnit] = useState('gram');

  useEffect(() => {
    if (visible && plan.mealPlan) {
      fetchMealPlanDetails();
    }
  }, [visible, plan.mealPlan]);

  const fetchMealPlanDetails = async () => {
    if (!plan.mealPlan) return;
    
    setRefreshing(true);
    try {
      const details = await MealService.getMealPlan(plan.mealPlan.id);
      setMealPlan(details.meal_plan);
    } catch (error) {
      console.error('Error fetching meal plan details:', error);
      Alert.alert('Error', 'Failed to load meal plan details');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchFoodItems = async () => {
    try {
      const response = await MealService.getFoodItems();
      setFoodItems(response.food_items);
    } catch (error) {
      console.error('Error fetching food items:', error);
      Alert.alert('Error', 'Failed to load food items');
    }
  };

  const handleAddDay = async (day: string) => {
    if (!mealPlan) return;

    setLoading(true);
    try {
      await MealService.addDailyPlan(mealPlan.id, { day: day as any });
      await fetchMealPlanDetails();
      setShowAddDayModal(false);
      Alert.alert('Success', 'Day added successfully!');
    } catch (error) {
      console.error('Error adding day:', error);
      Alert.alert('Error', 'Failed to add day');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMealTime = async (name: string, time: string) => {
    if (!mealPlan || !selectedDayId) return;

    setLoading(true);
    try {
      await MealService.addMealTime(mealPlan.id, selectedDayId, { name, time });
      await fetchMealPlanDetails();
      setShowAddMealTimeModal(false);
      setSelectedDayId(null);
      Alert.alert('Success', 'Meal time added successfully!');
    } catch (error) {
      console.error('Error adding meal time:', error);
      Alert.alert('Error', 'Failed to add meal time');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async () => {
    if (!mealPlan || !selectedDayId || !selectedMealTimeId || !selectedFoodItem) return;

    setLoading(true);
    try {
      await MealService.addFoodToMealTime(mealPlan.id, selectedDayId, selectedMealTimeId, {
        food_item_id: selectedFoodItem.id,
        amount: parseInt(foodAmount) || 100,
        unit: foodUnit,
        order: 1,
      });
      await fetchMealPlanDetails();
      setShowAddFoodModal(false);
      setSelectedDayId(null);
      setSelectedMealTimeId(null);
      setSelectedFoodItem(null);
      setFoodAmount('100');
      Alert.alert('Success', 'Food item added successfully!');
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food item');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!mealPlan) return;

    setLoading(true);
    try {
      await MealService.updateMealPlan(mealPlan.id, {
        is_public: !mealPlan.is_public
      });
      await fetchMealPlanDetails();
      Alert.alert('Success', `Meal plan is now ${!mealPlan.is_public ? 'public' : 'private'}`);
    } catch (error) {
      console.error('Error updating meal plan:', error);
      Alert.alert('Error', 'Failed to update meal plan');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!mealPlan) return;

    setLoading(true);
    try {
      await MealService.updateMealPlan(mealPlan.id, {
        status: 'published'
      });
      await fetchMealPlanDetails();
      Alert.alert('Success', 'Meal plan published successfully!');
    } catch (error) {
      console.error('Error publishing meal plan:', error);
      Alert.alert('Error', 'Failed to publish meal plan');
    } finally {
      setLoading(false);
    }
  };

  const filteredFoodItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
  );

  const availableDays = DAY_OPTIONS.filter(day =>
    !mealPlan?.daily_plans?.some(dp => dp.day === day.key)
  );

  const renderDayCard = (dailyPlan: DailyPlan) => (
    <View key={dailyPlan.id} style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>{dailyPlan.day_display}</Text>
        <View style={styles.dayStats}>
          <Text style={styles.dayCalories}>{dailyPlan.total_calories} cal</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedDayId(dailyPlan.id);
              setShowAddMealTimeModal(true);
            }}
          >
            <Ionicons name="add" size={16} color="#A78BFA" />
            <Text style={styles.addButtonText}>Meal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {dailyPlan.meal_times.map((mealTime) => (
        <View key={mealTime.id} style={styles.mealTimeCard}>
          <View style={styles.mealTimeHeader}>
            <Text style={styles.mealTimeName}>{mealTime.name}</Text>
            <Text style={styles.mealTimeInfo}>
              {mealTime.time} • {mealTime.total_calories} cal
            </Text>
            <TouchableOpacity
              style={styles.addFoodButton}
              onPress={() => {
                setSelectedDayId(dailyPlan.id);
                setSelectedMealTimeId(mealTime.id);
                setShowAddFoodModal(true);
                fetchFoodItems();
              }}
            >
              <Ionicons name="add" size={14} color="#A78BFA" />
            </TouchableOpacity>
          </View>

          {mealTime.food_items.map((foodItem) => (
            <View key={foodItem.id} style={styles.foodItem}>
              <Text style={styles.foodName}>{foodItem.food_item_details.name}</Text>
              <Text style={styles.foodAmount}>
                {foodItem.amount}{foodItem.unit} • {Math.round(foodItem.calories)} cal
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  if (!mealPlan) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text>Loading meal plan...</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>
              {mealPlan.title}
            </Text>
            <View style={styles.headerActions}>
              {user?.userType === 'Coach' && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleTogglePublic}
                  disabled={loading}
                >
                  <Ionicons 
                    name={mealPlan.is_public ? "eye" : "eye-off"} 
                    size={20} 
                    color="#A78BFA" 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchMealPlanDetails} />
          }>
            {/* Meal Plan Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Goal:</Text>
                <Text style={styles.infoValue}>{mealPlan.goal_display}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={[styles.infoValue, { color: mealPlan.status === 'published' ? '#10B981' : '#F59E0B' }]}>
                  {mealPlan.status_display}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Calories:</Text>
                <Text style={styles.infoValue}>{mealPlan.total_calories} cal</Text>
              </View>
              {mealPlan.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.description}>{mealPlan.description}</Text>
                </View>
              )}
            </View>

            {/* Daily Plans */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Daily Plans</Text>
                {availableDays.length > 0 && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddDayModal(true)}
                  >
                    <Ionicons name="add" size={16} color="#A78BFA" />
                    <Text style={styles.addButtonText}>Add Day</Text>
                  </TouchableOpacity>
                )}
              </View>

              {mealPlan.daily_plans && mealPlan.daily_plans.length > 0 ? (
                mealPlan.daily_plans.map(renderDayCard)
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No daily plans yet</Text>
                  <Text style={styles.emptySubtext}>Add your first day to get started</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {mealPlan.status === 'draft' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.publishButton]}
                onPress={handlePublish}
                disabled={loading}
              >
                <Text style={styles.publishButtonText}>Publish Plan</Text>
              </TouchableOpacity>
            )}
            
            {onChoose && (
              <TouchableOpacity
                style={[styles.actionButton, styles.chooseButton]}
                onPress={() => onChoose(mealPlan)}
              >
                <Text style={styles.chooseButtonText}>Apply Plan</Text>
              </TouchableOpacity>
            )}

            {onAssign && user?.userType === 'Coach' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.assignButton]}
                onPress={() => onAssign(mealPlan)}
              >
                <Text style={styles.assignButtonText}>Assign to Client</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Add Day Modal */}
      <Modal visible={showAddDayModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Day</Text>
            {availableDays.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={styles.optionButton}
                onPress={() => handleAddDay(day.key)}
                disabled={loading}
              >
                <Text style={styles.optionText}>{day.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddDayModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Meal Time Modal */}
      <Modal visible={showAddMealTimeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Meal Time</Text>
            {MEAL_TIME_TEMPLATES.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAddMealTime(template.name, template.time)}
                disabled={loading}
              >
                <Text style={styles.optionText}>{template.name}</Text>
                <Text style={styles.optionSubtext}>{template.time}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddMealTimeModal(false);
                setSelectedDayId(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Food Modal */}
      <Modal visible={showAddFoodModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Food Item</Text>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search food items..."
              value={foodSearchQuery}
              onChangeText={setFoodSearchQuery}
            />

            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="Amount"
                value={foodAmount}
                onChangeText={setFoodAmount}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>{foodUnit}</Text>
            </View>

            <FlatList
              data={filteredFoodItems}
              keyExtractor={(item) => item.id}
              style={styles.foodList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.foodOptionButton,
                    selectedFoodItem?.id === item.id && styles.selectedFoodOption
                  ]}
                  onPress={() => setSelectedFoodItem(item)}
                >
                  <Text style={styles.foodOptionName}>{item.name}</Text>
                  <Text style={styles.foodOptionInfo}>
                    {item.calories} cal per {item.serving_size}{item.serving_unit}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.addFoodModalButton]}
                onPress={handleAddFood}
                disabled={!selectedFoodItem || loading}
              >
                <Text style={styles.addFoodButtonText}>Add Food</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddFoodModal(false);
                  setSelectedDayId(null);
                  setSelectedMealTimeId(null);
                  setSelectedFoodItem(null);
                  setFoodSearchQuery('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '500',
    marginLeft: 4,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  dayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayCalories: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  mealTimeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  mealTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTimeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  mealTimeInfo: {
    fontSize: 12,
    color: '#666',
  },
  addFoodButton: {
    padding: 4,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  foodName: {
    fontSize: 13,
    color: '#1a1a1a',
    flex: 1,
  },
  foodAmount: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  publishButton: {
    backgroundColor: '#10B981',
  },
  publishButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  chooseButton: {
    backgroundColor: '#A78BFA',
  },
  chooseButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  assignButton: {
    backgroundColor: '#3B82F6',
  },
  assignButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  optionSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  unitText: {
    fontSize: 16,
    color: '#666',
  },
  foodList: {
    maxHeight: 200,
    marginBottom: 12,
  },
  foodOptionButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#f8f9fa',
  },
  selectedFoodOption: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 1,
    borderColor: '#A78BFA',
  },
  foodOptionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  foodOptionInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addFoodModalButton: {
    backgroundColor: '#A78BFA',
  },
  addFoodButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});