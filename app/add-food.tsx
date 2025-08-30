import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  searchFood,
  addFoodEntry,
  quickAddFood,
  getCustomFoods,
  createCustomFood,
  updateCustomFood,
  deleteCustomFood,
  FoodItemDetails,
  CustomFood,
  MealType,
  ConsumptionUnit,
  FoodSearchResult,
  CreateCustomFoodRequest,
  UpdateCustomFoodRequest,
} from './services/calorieTrackingService';

type TabType = 'search' | 'quick-add' | 'custom-foods';

export default function AddFoodScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    database_foods: FoodItemDetails[];
    custom_foods: CustomFood[];
  }>({ database_foods: [], custom_foods: [] });
  const [selectedFood, setSelectedFood] = useState<FoodItemDetails | CustomFood | null>(null);
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [editingCustomFood, setEditingCustomFood] = useState<CustomFood | null>(null);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  
  // Form data for food entry
  const [formData, setFormData] = useState({
    amount: '',
    unit: 'gram' as ConsumptionUnit,
    meal_type: 'lunch' as MealType,
    notes: '',
  });

  // Form data for quick add
  const [quickAddData, setQuickAddData] = useState({
    name: '',
    calories: '',
    amount: '',
    unit: 'piece' as ConsumptionUnit,
    meal_type: 'lunch' as MealType,
    notes: '',
  });

  // Form data for custom food
  const [customFoodData, setCustomFoodData] = useState({
    name: '',
    serving_size: '',
    serving_unit: 'gram' as ConsumptionUnit,
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    is_favorite: false,
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
    if (activeTab === 'custom-foods') {
      loadCustomFoods();
    }
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery.length >= 2 && activeTab === 'search') {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (activeTab === 'search') {
      setSearchResults({ database_foods: [], custom_foods: [] });
    }
  }, [searchQuery, activeTab]);

  const loadCustomFoods = async () => {
    try {
      setLoading(true);
      const response = await getCustomFoods();
      setCustomFoods(response.custom_foods);
    } catch (error) {
      console.error('Error loading custom foods:', error);
      Alert.alert('Error', 'Failed to load custom foods');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (searchQuery.length < 2) return;

    try {
      setSearching(true);
      const response = await searchFood({
        query: searchQuery,
        limit: 20,
        include_custom: true,
      });
      setSearchResults(response.results);
    } catch (error) {
      console.error('Error searching food:', error);
      Alert.alert('Error', 'Failed to search for food');
    } finally {
      setSearching(false);
    }
  };

  const handleFoodSelect = (food: FoodItemDetails | CustomFood) => {
    setSelectedFood(food);
    setSearchQuery('');
    setSearchResults({ database_foods: [], custom_foods: [] });
  };

  const calculateNutrition = () => {
    if (!selectedFood || !formData.amount) return null;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return null;

    // For database foods, use the nutrition per 100g
    if ('total_carbohydrates' in selectedFood) {
      const ratio = amount / 100;
      return {
        calories: Math.round(selectedFood.calories * ratio),
        protein: Math.round(selectedFood.protein * ratio * 10) / 10,
        carbs: Math.round(selectedFood.total_carbohydrates * ratio * 10) / 10,
        fat: Math.round(selectedFood.total_fat * ratio * 10) / 10,
      };
    }

    // For custom foods, use the serving size
    if ('carbs' in selectedFood) {
      const ratio = amount / selectedFood.serving_size;
      return {
        calories: Math.round(selectedFood.calories * ratio),
        protein: Math.round(selectedFood.protein * ratio * 10) / 10,
        carbs: Math.round(selectedFood.carbs * ratio * 10) / 10,
        fat: Math.round(selectedFood.fat * ratio * 10) / 10,
      };
    }

    return null;
  };

  const handleSaveFoodEntry = async () => {
    if (!selectedFood || !formData.amount) {
      Alert.alert('Error', 'Please select a food and enter amount');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setSaving(true);
      
      let entryData;
      if ('nutrition_per_100g' in selectedFood) {
        // Database food
        entryData = {
          food_item_id: selectedFood.id,
          amount,
          unit: formData.unit,
          meal_type: formData.meal_type,
          notes: formData.notes.trim() || undefined,
        };
      } else {
        // Custom food
        entryData = {
          custom_food_id: selectedFood.id,
          amount,
          unit: formData.unit,
          meal_type: formData.meal_type,
          notes: formData.notes.trim() || undefined,
        };
      }

      await addFoodEntry(entryData);
      Alert.alert('Success', 'Food added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error adding food entry:', error);
      Alert.alert('Error', 'Failed to add food');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!quickAddData.name.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    const calories = parseFloat(quickAddData.calories);
    if (isNaN(calories) || calories <= 0) {
      Alert.alert('Error', 'Please enter a valid calorie amount');
      return;
    }

    const amount = parseFloat(quickAddData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setSaving(true);
      await quickAddFood({
        name: quickAddData.name.trim(),
        calories,
        amount,
        unit: quickAddData.unit,
        meal_type: quickAddData.meal_type,
        notes: quickAddData.notes.trim() || undefined,
      });

      Alert.alert('Success', 'Food added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error quick adding food:', error);
      Alert.alert('Error', 'Failed to add food');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCustomFood = () => {
    setEditingCustomFood(null);
    setCustomFoodData({
      name: '',
      serving_size: '',
      serving_unit: 'gram',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      is_favorite: false,
      notes: '',
    });
    setShowCustomFoodModal(true);
  };

  const handleEditCustomFood = (food: CustomFood) => {
    setEditingCustomFood(food);
    setCustomFoodData({
      name: food.name,
      serving_size: food.serving_size.toString(),
      serving_unit: food.serving_unit as ConsumptionUnit,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
      is_favorite: food.is_favorite,
      notes: food.notes || '',
    });
    setShowCustomFoodModal(true);
  };

  const handleSaveCustomFood = async () => {
    if (!customFoodData.name.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    const servingSize = parseFloat(customFoodData.serving_size);
    if (isNaN(servingSize) || servingSize <= 0) {
      Alert.alert('Error', 'Please enter a valid serving size');
      return;
    }

    const calories = parseFloat(customFoodData.calories);
    if (isNaN(calories) || calories < 0) {
      Alert.alert('Error', 'Please enter a valid calorie amount');
      return;
    }

    const protein = parseFloat(customFoodData.protein);
    const carbs = parseFloat(customFoodData.carbs);
    const fat = parseFloat(customFoodData.fat);

    if (isNaN(protein) || isNaN(carbs) || isNaN(fat) || protein < 0 || carbs < 0 || fat < 0) {
      Alert.alert('Error', 'Please enter valid macronutrient values');
      return;
    }

    try {
      setSaving(true);
      
      if (editingCustomFood) {
        const updateData: UpdateCustomFoodRequest = {
          name: customFoodData.name.trim(),
          serving_size: servingSize,
          serving_unit: customFoodData.serving_unit,
          calories,
          protein,
          carbs,
          fat,
          is_favorite: customFoodData.is_favorite,
          notes: customFoodData.notes.trim() || undefined,
        };
        await updateCustomFood(editingCustomFood.id, updateData);
      } else {
        const createData: CreateCustomFoodRequest = {
          name: customFoodData.name.trim(),
          serving_size: servingSize,
          serving_unit: customFoodData.serving_unit,
          calories,
          protein,
          carbs,
          fat,
          is_favorite: customFoodData.is_favorite,
          notes: customFoodData.notes.trim() || undefined,
        };
        await createCustomFood(createData);
      }

      setShowCustomFoodModal(false);
      loadCustomFoods();
      Alert.alert('Success', `Custom food ${editingCustomFood ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving custom food:', error);
      Alert.alert('Error', `Failed to ${editingCustomFood ? 'update' : 'create'} custom food`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomFood = async (food: CustomFood) => {
    Alert.alert(
      'Delete Custom Food',
      `Are you sure you want to delete "${food.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomFood(food.id);
              loadCustomFoods();
              Alert.alert('Success', 'Custom food deleted successfully');
            } catch (error) {
              console.error('Error deleting custom food:', error);
              Alert.alert('Error', 'Failed to delete custom food');
            }
          },
        },
      ]
    );
  };

  const renderSearchTab = () => (
    <View style={styles.tabContent}>
      {/* Search Description */}
      <ThemedView style={[styles.infoCard, { backgroundColor: cardBackground }]}>
        <View style={styles.infoHeader}>
          <Ionicons name="search" size={20} color="#4CAF50" />
          <ThemedText style={styles.infoTitle}>Search Foods</ThemedText>
        </View>
        <ThemedText style={styles.infoText}>
          Search through our extensive food database and your personal custom foods. Select any food to add it to your daily log with custom portions.
        </ThemedText>
      </ThemedView>

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: inputBackground }]}>
        <Ionicons name="search" size={20} color={textColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search for food..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searching && <ActivityIndicator size="small" color={primaryColor} />}
      </View>

      {/* Search Results */}
      {searchResults.database_foods.length > 0 || searchResults.custom_foods.length > 0 ? (
        <View style={styles.resultsContainer}>
          {searchResults.database_foods.length > 0 && (
            <View style={styles.resultSection}>
              <ThemedText style={styles.sectionTitle}>Database Foods</ThemedText>
              {searchResults.database_foods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={[styles.foodItem, { backgroundColor: cardBackground }]}
                  onPress={() => handleFoodSelect(food)}
                >
                  <View style={styles.foodInfo}>
                    <ThemedText style={styles.foodName}>{food.name}</ThemedText>
                    <ThemedText style={styles.foodNutrition}>
                      {food.calories} cal / 100g
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={textColor} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {searchResults.custom_foods.length > 0 && (
            <View style={styles.resultSection}>
              <ThemedText style={styles.sectionTitle}>My Foods</ThemedText>
              {searchResults.custom_foods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={[styles.foodItem, { backgroundColor: cardBackground }]}
                  onPress={() => handleFoodSelect(food)}
                >
                  <View style={styles.foodInfo}>
                    <ThemedText style={styles.foodName}>{food.name}</ThemedText>
                    <ThemedText style={styles.foodNutrition}>
                      {food.calories} cal / {food.serving_size}{food.serving_unit}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={textColor} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ) : searchQuery.length >= 2 && !searching ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <ThemedText style={styles.emptyText}>No foods found</ThemedText>
          <ThemedText style={styles.emptySubtext}>Try a different search term</ThemedText>
        </View>
      ) : null}

      {/* Selected Food Form */}
      {selectedFood && (
        <ThemedView style={[styles.selectedFoodCard, { backgroundColor: cardBackground }]}>
          <View style={styles.selectedFoodHeader}>
            <ThemedText style={styles.selectedFoodName}>{selectedFood.name}</ThemedText>
            <TouchableOpacity onPress={() => setSelectedFood(null)}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {calculateNutrition() && (
            <View style={styles.nutritionPreview}>
              <ThemedText style={styles.nutritionText}>
                {calculateNutrition()?.calories} cal • {calculateNutrition()?.protein}g protein • {calculateNutrition()?.carbs}g carbs • {calculateNutrition()?.fat}g fat
              </ThemedText>
            </View>
          )}

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <ThemedText style={styles.fieldLabel}>Amount</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="100"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formField}>
              <ThemedText style={styles.fieldLabel}>Unit</ThemedText>
              <View style={[styles.pickerContainer, { backgroundColor: inputBackground }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {units.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        formData.unit === unit && { backgroundColor: primaryColor },
                      ]}
                      onPress={() => setFormData({ ...formData, unit })}
                    >
                      <ThemedText
                        style={[
                          styles.unitButtonText,
                          formData.unit === unit && { color: '#fff' },
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

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Meal Type</ThemedText>
            <View style={[styles.pickerContainer, { backgroundColor: inputBackground }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {mealTypes.map((meal) => (
                  <TouchableOpacity
                    key={meal}
                    style={[
                      styles.mealButton,
                      formData.meal_type === meal && { backgroundColor: primaryColor },
                    ]}
                    onPress={() => setFormData({ ...formData, meal_type: meal })}
                  >
                    <ThemedText
                      style={[
                        styles.mealButtonText,
                        formData.meal_type === meal && { color: '#fff' },
                      ]}
                    >
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Notes (Optional)</ThemedText>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Add notes..."
              placeholderTextColor="#666"
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: primaryColor }]}
            onPress={handleSaveFoodEntry}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.saveButtonText}>Add to Daily Log</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      )}
    </View>
  );

  const renderQuickAddTab = () => (
    <View style={styles.tabContent}>
      {/* Quick Add Description */}
      <ThemedView style={[styles.infoCard, { backgroundColor: cardBackground }]}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={20} color="#FFA726" />
          <ThemedText style={styles.infoTitle}>Quick Add Information</ThemedText>
        </View>
        <ThemedText style={styles.infoText}>
          This feature allows you to quickly log food items manually. The food item is added to your daily log but is not saved to your personal food database. Use this for one-time entries or foods you don't plan to log frequently.
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.formCard, { backgroundColor: cardBackground }]}>
        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Food Name *</ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
            value={quickAddData.name}
            onChangeText={(text) => setQuickAddData({ ...quickAddData, name: text })}
            placeholder="e.g., Homemade smoothie"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Calories *</ThemedText>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
              value={quickAddData.calories}
              onChangeText={(text) => setQuickAddData({ ...quickAddData, calories: text })}
              placeholder="150"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Amount *</ThemedText>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
              value={quickAddData.amount}
              onChangeText={(text) => setQuickAddData({ ...quickAddData, amount: text })}
              placeholder="1"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Unit</ThemedText>
          <View style={[styles.pickerContainer, { backgroundColor: inputBackground }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {units.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitButton,
                    quickAddData.unit === unit && { backgroundColor: primaryColor },
                  ]}
                  onPress={() => setQuickAddData({ ...quickAddData, unit })}
                >
                  <ThemedText
                    style={[
                      styles.unitButtonText,
                      quickAddData.unit === unit && { color: '#fff' },
                    ]}
                  >
                    {unit}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Meal Type</ThemedText>
          <View style={[styles.pickerContainer, { backgroundColor: inputBackground }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mealTypes.map((meal) => (
                <TouchableOpacity
                  key={meal}
                  style={[
                    styles.mealButton,
                    quickAddData.meal_type === meal && { backgroundColor: primaryColor },
                  ]}
                  onPress={() => setQuickAddData({ ...quickAddData, meal_type: meal })}
                >
                  <ThemedText
                    style={[
                      styles.mealButtonText,
                      quickAddData.meal_type === meal && { color: '#fff' },
                    ]}
                  >
                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Notes (Optional)</ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
            value={quickAddData.notes}
            onChangeText={(text) => setQuickAddData({ ...quickAddData, notes: text })}
            placeholder="Add notes..."
            placeholderTextColor="#666"
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: primaryColor }]}
          onPress={handleQuickAdd}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Add to Daily Log</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    </View>
  );

  const renderCustomFoodsTab = () => (
    <View style={styles.tabContent}>
      {/* Custom Foods Description */}
      <ThemedView style={[styles.infoCard, { backgroundColor: cardBackground }]}>
        <View style={styles.infoHeader}>
          <Ionicons name="bookmark" size={20} color="#9C27B0" />
          <ThemedText style={styles.infoTitle}>My Custom Foods</ThemedText>
        </View>
        <ThemedText style={styles.infoText}>
          Create and manage your personal food database. These foods are saved and can be reused for future logging. Perfect for homemade meals, restaurant dishes, or frequently consumed foods.
        </ThemedText>
      </ThemedView>

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: primaryColor }]}
        onPress={handleCreateCustomFood}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <ThemedText style={styles.createButtonText}>Create Custom Food</ThemedText>
      </TouchableOpacity>

      {loading ? (
        <LoadingSpinner />
      ) : customFoods.length > 0 ? (
        <View style={styles.customFoodsList}>
          {customFoods.map((food) => (
            <ThemedView key={food.id} style={[styles.customFoodItem, { backgroundColor: cardBackground }]}>
              <View style={styles.customFoodInfo}>
                <ThemedText style={styles.customFoodName}>{food.name}</ThemedText>
                <ThemedText style={styles.customFoodNutrition}>
                  {food.calories} cal / {food.serving_size}{food.serving_unit}
                </ThemedText>
                <ThemedText style={styles.customFoodMacros}>
                  P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                </ThemedText>
              </View>
              <View style={styles.customFoodActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditCustomFood(food)}
                >
                  <Ionicons name="pencil" size={20} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteCustomFood(food)}
                >
                  <Ionicons name="trash" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </ThemedView>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={48} color="#ccc" />
          <ThemedText style={styles.emptyText}>No custom foods yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>Create your first custom food</ThemedText>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Add Food</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Ionicons 
              name="search" 
              size={20} 
              color={activeTab === 'search' ? primaryColor : textColor} 
            />
            <ThemedText style={[styles.tabText, activeTab === 'search' && { color: primaryColor }]}>
              Search
            </ThemedText>
            <ThemedText style={[styles.tabSubtext, activeTab === 'search' && { color: primaryColor }]}>
              Database & custom foods
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'quick-add' && styles.activeTab]}
            onPress={() => setActiveTab('quick-add')}
          >
            <Ionicons 
              name="add-circle" 
              size={20} 
              color={activeTab === 'quick-add' ? primaryColor : textColor} 
            />
            <ThemedText style={[styles.tabText, activeTab === 'quick-add' && { color: primaryColor }]}>
              Quick Add
            </ThemedText>
            <ThemedText style={[styles.tabSubtext, activeTab === 'quick-add' && { color: primaryColor }]}>
              Manual entry (not saved)
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'custom-foods' && styles.activeTab]}
            onPress={() => setActiveTab('custom-foods')}
          >
            <Ionicons 
              name="bookmark" 
              size={20} 
              color={activeTab === 'custom-foods' ? primaryColor : textColor} 
            />
            <ThemedText style={[styles.tabText, activeTab === 'custom-foods' && { color: primaryColor }]}>
              My Foods
            </ThemedText>
            <ThemedText style={[styles.tabSubtext, activeTab === 'custom-foods' && { color: primaryColor }]}>
              Personal food database
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'search' && renderSearchTab()}
          {activeTab === 'quick-add' && renderQuickAddTab()}
          {activeTab === 'custom-foods' && renderCustomFoodsTab()}
        </ScrollView>

        {/* Custom Food Modal */}
        <Modal
          visible={showCustomFoodModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCustomFoodModal(false)}>
                <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>
                {editingCustomFood ? 'Edit Custom Food' : 'Create Custom Food'}
              </ThemedText>
              <TouchableOpacity onPress={handleSaveCustomFood} disabled={saving}>
                <ThemedText style={[styles.saveButtonText, { color: primaryColor }]}>
                  {saving ? 'Saving...' : 'Save'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Food Name *</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
                  value={customFoodData.name}
                  onChangeText={(text) => setCustomFoodData({ ...customFoodData, name: text })}
                  placeholder="e.g., My Homemade Smoothie"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Serving Size *</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
                    value={customFoodData.serving_size}
                    onChangeText={(text) => setCustomFoodData({ ...customFoodData, serving_size: text })}
                    placeholder="100"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Unit</ThemedText>
                  <View style={[styles.pickerContainer, { backgroundColor: inputBackground }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {units.map((unit) => (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.unitButton,
                            customFoodData.serving_unit === unit && { backgroundColor: primaryColor },
                          ]}
                          onPress={() => setCustomFoodData({ ...customFoodData, serving_unit: unit })}
                        >
                          <ThemedText
                            style={[
                              styles.unitButtonText,
                              customFoodData.serving_unit === unit && { color: '#fff' },
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

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Calories *</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
                    value={customFoodData.calories}
                    onChangeText={(text) => setCustomFoodData({ ...customFoodData, calories: text })}
                    placeholder="150"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Protein (g)</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
                    value={customFoodData.protein}
                    onChangeText={(text) => setCustomFoodData({ ...customFoodData, protein: text })}
                    placeholder="10"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Carbs (g)</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
                    value={customFoodData.carbs}
                    onChangeText={(text) => setCustomFoodData({ ...customFoodData, carbs: text })}
                    placeholder="20"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Fat (g)</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
                    value={customFoodData.fat}
                    onChangeText={(text) => setCustomFoodData({ ...customFoodData, fat: text })}
                    placeholder="5"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Notes (Optional)</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: inputBackground, color: textColor }]}
                  value={customFoodData.notes}
                  onChangeText={(text) => setCustomFoodData({ ...customFoodData, notes: text })}
                  placeholder="Add notes..."
                  placeholderTextColor="#666"
                  multiline
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
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
  headerSpacer: {
    width: 40, // Adjust as needed for spacing
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff', // Example primary color
  },
  tabText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  tabSubtext: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
  },
  tabContent: {
    padding: 20,
  },
  searchCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchSpinner: {
    position: 'absolute',
    right: 12,
  },
  searchResults: {
    marginTop: 16,
    maxHeight: 300,
  },
  noResultsText: {
    textAlign: 'center',
    paddingVertical: 20,
    opacity: 0.6,
  },
  foodItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  foodBrand: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  foodNutrition: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 4,
  },
  resultsContainer: {
    marginTop: 16,
  },
  resultSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  selectedFoodCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedFoodName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  nutritionPreview: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  nutritionText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoCard: {
    margin: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
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
  formField: {
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldLabel: {
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  mealButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mealButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    margin: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  customFoodsList: {
    marginTop: 10,
  },
  customFoodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  customFoodInfo: {
    flex: 1,
  },
  customFoodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  customFoodNutrition: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 4,
  },
  customFoodMacros: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  customFoodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 15,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007bff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
}); 