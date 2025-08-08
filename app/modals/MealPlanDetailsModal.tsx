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
  RefreshControl,
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
  onUpdate?: () => void;
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

export const MealPlanDetailsModal = ({
  visible,
  onClose,
  plan,
  onChoose,
  onAssign,
  onDelete,
  onUpdate,
}: MealPlanDetailsModalProps) => {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
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
    
    setLoading(true);
    try {
      const details = await MealService.getMealPlan(plan.mealPlan.id);
      setMealPlan(details.meal_plan);
    } catch (error) {
      console.error('Error fetching meal plan details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load meal plan details';
      if (errorMessage.includes('Authentication required')) {
        console.log('Authentication required, user will be redirected to login');
        onClose();
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDays = () => {
    if (!mealPlan) return [];
    const existingDays = mealPlan.daily_plans?.map(dp => dp.day) || [];
    return DAY_OPTIONS.filter(dayOption => !existingDays.includes(dayOption.key as any));
  };

  const getSortedDailyPlans = () => {
    if (!mealPlan?.daily_plans) return [];
    return [...mealPlan.daily_plans].sort((a, b) => {
      const aOrder = DAY_OPTIONS.findIndex(d => d.key === a.day);
      const bOrder = DAY_OPTIONS.findIndex(d => d.key === b.day);
      return aOrder - bOrder;
    });
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

  const handleAddDay = () => {
    setShowAddDayModal(true);
  };

  const addDay = async (day: string) => {
    if (!mealPlan) return;

    try {
      await MealService.addDailyPlan(mealPlan.id, { day: day as any });
      await fetchMealPlanDetails();
      onUpdate?.();
    } catch (error) {
      console.error('Error adding day:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add day';
      if (errorMessage.includes('Authentication required')) {
        onClose();
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleRemoveDay = async (dayId: string, dayDisplay: string) => {
    if (!mealPlan) return;

    Alert.alert(
      'Remove Day',
      `Remove ${dayDisplay}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await MealService.removeDailyPlan(mealPlan.id, dayId);
              await fetchMealPlanDetails();
              onUpdate?.();
            } catch (error) {
              console.error('Error removing day:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to remove day';
              if (errorMessage.includes('Authentication required')) {
                onClose();
              } else {
                Alert.alert('Error', errorMessage);
              }
            }
          },
        },
      ]
    );
  };

  const handleAddMealTime = (dayId: string) => {
    setSelectedDayId(dayId);
    setShowAddMealTimeModal(true);
  };

  const addMealTime = async (name: string, time: string) => {
    if (!mealPlan || !selectedDayId) return;

    try {
      await MealService.addMealTime(mealPlan.id, selectedDayId, { name, time });
      await fetchMealPlanDetails();
      onUpdate?.();
      setSelectedDayId(null);
    } catch (error) {
      console.error('Error adding meal time:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add meal time';
      if (errorMessage.includes('Authentication required')) {
        onClose();
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleAddFood = (dayId: string, mealTimeId: string) => {
    setSelectedDayId(dayId);
    setSelectedMealTimeId(mealTimeId);
    setShowAddFoodModal(true);
    fetchFoodItems();
  };

  const addFood = async () => {
    if (!mealPlan || !selectedDayId || !selectedMealTimeId || !selectedFoodItem) return;

    try {
      await MealService.addFoodToMealTime(mealPlan.id, selectedDayId, selectedMealTimeId, {
        food_item_id: selectedFoodItem.id,
        amount: parseInt(foodAmount) || 100,
        unit: foodUnit,
        order: 1,
      });
      await fetchMealPlanDetails();
      onUpdate?.();
      setSelectedDayId(null);
      setSelectedMealTimeId(null);
      setSelectedFoodItem(null);
      setFoodAmount('100');
    } catch (error) {
      console.error('Error adding food:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add food item';
      if (errorMessage.includes('Authentication required')) {
        onClose();
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleTogglePublic = async () => {
    if (!mealPlan) return;

    const newPublicStatus = !mealPlan.is_public;
    const action = newPublicStatus ? 'make public' : 'make private';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)}`,
      `Are you sure you want to ${action} this meal plan? ${newPublicStatus ? 'Other users will be able to discover and apply it.' : 'It will no longer be visible to other users.'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              await MealService.updateMealPlan(mealPlan.id, { 
                is_public: newPublicStatus 
              });
              await fetchMealPlanDetails();
              onUpdate?.();
              
              setTimeout(() => {
                Alert.alert(
                  'Success', 
                  `Meal plan is now ${newPublicStatus ? 'public' : 'private'}.`
                );
              }, 100);
            } catch (error) {
              console.error('Error updating meal plan visibility:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to update meal plan visibility';
              if (errorMessage.includes('Authentication required')) {
                onClose();
              } else {
                Alert.alert('Error', errorMessage);
              }
            }
          },
        },
      ]
    );
  };

  const handlePublish = async () => {
    if (!mealPlan) return;

    const newStatus = mealPlan.status === 'published' ? 'draft' : 'published';
    const action = newStatus === 'published' ? 'publish' : 'unpublish';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Plan`,
      `Are you sure you want to ${action} this meal plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              await MealService.updateMealPlan(mealPlan.id, { status: newStatus });
              await fetchMealPlanDetails();
              onUpdate?.();
            } catch (error) {
              console.error('Error updating meal plan:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to update meal plan';
              if (errorMessage.includes('Authentication required')) {
                onClose();
              } else {
                Alert.alert('Error', errorMessage);
              }
            }
          },
        },
      ]
    );
  };

  const filteredFoodItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
  );

  const availableDays = DAY_OPTIONS.filter(day =>
    !mealPlan?.daily_plans?.some(dp => dp.day === day.key)
  );

  const renderMealTime = (mealTime: MealTime, dayId: string) => {
    return (
      <View key={mealTime.id} style={styles.mealTimeCard}>
        <View style={styles.mealTimeHeader}>
          <View style={styles.mealTimeInfo}>
            <Text style={styles.mealTimeName}>{mealTime.name}</Text>
            <Text style={styles.mealTimeStats}>
              {mealTime.food_items.length} foods • {mealTime.total_calories} cal
            </Text>
          </View>
          <View style={styles.mealTimeActions}>
            <TouchableOpacity
              onPress={() => handleAddFood(dayId, mealTime.id)}
              style={styles.addFoodButton}
            >
              <Ionicons name="add" size={20} color="#A78BFA" />
            </TouchableOpacity>
          </View>
        </View>

        {mealTime.food_items.length > 0 ? (
          mealTime.food_items.map(foodItem => renderFoodItem(foodItem, dayId, mealTime.id))
        ) : (
          <Text style={styles.noFoodText}>
            No food items yet. Tap + to add foods.
          </Text>
        )}
      </View>
    );
  };



  const renderFoodItem = (foodItem: MealPlanFoodItem, dayId: string, mealTimeId: string) => {
    return (
      <View key={foodItem.id} style={styles.foodItemCard}>
        <View style={styles.foodItemInfo}>
          <Text style={styles.foodItemName}>
            {foodItem.food_item_details.name}
          </Text>
          <Text style={styles.foodItemStats}>
            {foodItem.amount}{foodItem.unit} • {Math.round(foodItem.calories)} cal
          </Text>
        </View>
        
        <View style={styles.foodItemActions}>
          <TouchableOpacity
            onPress={() => {/* handleEditFoodItem */}}
            style={styles.editButton}
          >
            <Ionicons name="create-outline" size={18} color="#A78BFA" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {/* handleRemoveFoodItem(dayId, mealTimeId, foodItem.id, foodItem.food_item_details.name) */}}
            style={styles.removeButton}
          >
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDay = (day: DailyPlan) => {
    return (
      <View key={day.id} style={styles.dayCard}>
        <TouchableOpacity
          style={styles.dayHeader}
          onPress={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
        >
          <View style={styles.dayInfo}>
            <View style={styles.dayTitleRow}>
              <Text style={styles.dayTitle}>{day.day_display}</Text>
            </View>
            <Text style={styles.dayStats}>
              {day.meal_times.length} meal times • {day.total_calories} cal
            </Text>
          </View>
          <View style={styles.dayActions}>
            <TouchableOpacity
              onPress={() => handleAddMealTime(day.id)}
              style={styles.addMealTimeButton}
            >
              <Ionicons name="add" size={20} color="#A78BFA" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRemoveDay(day.id, day.day_display)}
              style={styles.removeDayButton}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            </TouchableOpacity>
            <Ionicons
              name={expandedDay === day.id ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {expandedDay === day.id && (
          <View style={styles.mealTimesList}>
            {day.meal_times.length > 0 ? (
              day.meal_times.map(mealTime => renderMealTime(mealTime, day.id))
            ) : (
              <Text style={styles.noMealTimesText}>
                No meal times added yet. Tap + to add meal times.
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

if (!mealPlan && !loading) {
  return null;
}

return (
  <>
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.overlay}>
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1a1a1a" />
          </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Meal Plan
                        </Text>
            {mealPlan && (
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleTogglePublic} style={styles.actionButton}>
                  <Ionicons 
                    name={mealPlan!.is_public ? "globe" : "lock-closed"} 
                    size={20} 
                    color={mealPlan!.is_public ? "#4CAF50" : "#666"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePublish} style={styles.actionButton}>
                  <Text style={[
                    styles.publishText,
                    { color: mealPlan!.status === 'published' ? '#FF6B6B' : '#A78BFA' }
                  ]}>
                    {mealPlan!.status === 'published' ? 'Unpublish' : 'Publish'}
                </Text>
                </TouchableOpacity>
                {onChoose && mealPlan && (
                  <TouchableOpacity onPress={() => onChoose!(mealPlan!)} style={styles.actionButton}>
                    <Ionicons name="calendar-outline" size={20} color="#A78BFA" />
                  </TouchableOpacity>
                )}
                {user?.userType === 'Coach' && onAssign && mealPlan && (
                  <TouchableOpacity onPress={() => onAssign!(mealPlan!)} style={styles.actionButton}>
                    <Ionicons name="person-add-outline" size={20} color="#A78BFA" />
                  </TouchableOpacity>
                )}
                        </View>
            )}
            </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
                </View>
          ) : mealPlan ? (
            <ScrollView style={styles.content}>
              {/* Plan Info */}
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>
                  {mealPlan!.title}
                        </Text>
                {mealPlan!.description && (
                  <Text style={styles.planDescription}>
                    {mealPlan!.description}
          </Text>
                )}
                <View style={styles.planStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{mealPlan!.total_calories}</Text>
                    <Text style={styles.statLabel}>Total Calories</Text>
                      </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{mealPlan!.daily_plans?.length || 0}</Text>
                    <Text style={styles.statLabel}>Days</Text>
                    </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {mealPlan!.status === 'published' ? 'Published' : 'Draft'}
                        </Text>
                    <Text style={styles.statLabel}>Status</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {mealPlan!.is_public ? 'Public' : 'Private'}
                        </Text>
                    <Text style={styles.statLabel}>Visibility</Text>
                      </View>
                    </View>
                  </View>

              {/* Days Section */}
              <View style={styles.daysSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Days ({mealPlan!.daily_plans?.length || 0}/7)
                  </Text>
                  <TouchableOpacity onPress={handleAddDay} style={styles.addDayButton}>
                    <Ionicons name="add" size={20} color="#A78BFA" />
                    <Text style={styles.addDayText}>Add Day</Text>
                </TouchableOpacity>
                </View>

                {mealPlan!.daily_plans && mealPlan!.daily_plans!.length > 0 ? (
                  getSortedDailyPlans().map(renderDay)
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      No days added yet. Start by adding your first day!
                    </Text>
                  </View>
                )}
              </View>
        </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>

          {/* Add Day Modal */}
    <Modal visible={showAddDayModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.daySelectorContainer}>
          <View style={styles.daySelectorHeader}>
            <Text style={styles.daySelectorTitle}>Select Day to Add</Text>
        <TouchableOpacity
              onPress={() => setShowAddDayModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dayOptionsContainer}>
            {getAvailableDays().map((dayOption) => (
              <TouchableOpacity
                key={dayOption.key}
                style={styles.dayOptionButton}
                onPress={async () => {
                  setShowAddDayModal(false);
                  await addDay(dayOption.key);
                }}
              >
                <Text style={styles.dayOptionText}>
                  {dayOption.label}
          </Text>
        </TouchableOpacity>
            ))}
          </View>
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
              onPress={async () => {
                setShowAddMealTimeModal(false);
                await addMealTime(template.name, template.time);
              }}
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
              onPress={async () => {
                setShowAddFoodModal(false);
                await addFood();
              }}
              disabled={!selectedFoodItem}
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
  </>
);
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  planInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  planDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A78BFA',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  daysSection: {
    flex: 1,
    padding: 20,
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
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addDayText: {
    marginLeft: 4,
    color: '#A78BFA',
    fontWeight: '600',
  },
  dayCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dayInfo: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dayStats: {
    fontSize: 14,
    color: '#666',
  },
  dayActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addMealTimeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
  },
  removeDayButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  mealTimesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mealTimeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mealTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTimeInfo: {
    flex: 1,
  },
  mealTimeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  mealTimeStats: {
    fontSize: 12,
    color: '#666',
  },
  addFoodButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
  },
  foodItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 4,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  foodItemStats: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },
  noMealTimesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  noFoodText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 8,
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    minWidth: 300,
  },
  daySelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  daySelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  dayOptionsContainer: {
    gap: 8,
  },
  dayOptionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8f9fa',
  },
  dayOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlign: 'center',
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
    color: '#1a1a1a',
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
  

  foodItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  mealTimeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});