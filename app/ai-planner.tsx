import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Dimensions,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
import { UserProfileService, UserProfile } from './services/userProfileService';
import { SubscriptionGuard } from './components/SubscriptionGuard';
import {
  generateMealPlan,
  generateWorkoutPlan,
  getAITemplates,
  Template,
  GenerateMealPlanRequest,
  GenerateWorkoutPlanRequest,
} from './services/aiPlannerService';

const { width } = Dimensions.get('window');

type PlanType = 'meal_plan' | 'workout_plan';

export default function AIPlannerScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType>('meal_plan');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Meal plan options
  const [mealPlanOptions, setMealPlanOptions] = useState({
    goal: 'general_health' as const,
    days: 7,
    calorie_target: 2000,
    dietary_restrictions: [] as string[],
    meal_times: ['breakfast', 'lunch', 'dinner', 'snack'] as string[],
    // New enhanced parameters
    age: 25,
    gender: 'not_specified' as 'male' | 'female' | 'not_specified',
    current_weight: 70,
    weight_unit: 'kg' as 'kg' | 'lbs',
    target_weight: 70,
    height: 170,
    activity_level: 'moderately_active' as const,
    fitness_experience: 'beginner' as const,
    time_constraints: [] as string[],
    preferences: [] as string[],
  });

  // Workout plan options
  const [workoutPlanOptions, setWorkoutPlanOptions] = useState({
    category: 'general_fitness' as const,
    days: 7,
    difficulty: 'intermediate' as const,
    focus_areas: [] as string[],
    equipment: [] as string[],
    // New enhanced parameters
    age: 25,
    gender: 'not_specified' as 'male' | 'female' | 'not_specified',
    current_weight: 70,
    weight_unit: 'kg' as 'kg' | 'lbs',
    target_weight: 70,
    height: 170,
    activity_level: 'moderately_active' as const,
    fitness_experience: 'beginner' as const,
    time_constraints: [] as string[],
    injuries_limitations: [] as string[],
    workout_preferences: [] as string[],
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'background');

  useEffect(() => {
    loadData();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const profileResponse = await UserProfileService.getUserProfile();
      setUserProfile(profileResponse.user);
      
      // Pre-populate options with user data if available
      if (profileResponse.user) {
        const profile = profileResponse.user;
        
        // Update meal plan options
        if (profile.gender) {
          setMealPlanOptions(prev => ({ ...prev, gender: profile.gender }));
        }
        if (profile.weight) {
          setMealPlanOptions(prev => ({ 
            ...prev, 
            current_weight: profile.weight!.value,
            weight_unit: profile.weight!.unit 
          }));
        }
        if (profile.height) {
          const heightValue = profile.height.unit === 'cm' ? profile.height.value : 
                             profile.height.feet && profile.height.inches ? 
                             UserProfileService.convertHeightToCm(profile.height.feet, profile.height.inches) : 170;
          if (heightValue !== null) {
            setMealPlanOptions(prev => ({ 
              ...prev, 
              height: heightValue
            }));
          }
        }
        
        // Update workout plan options with same data
        const workoutHeightValue = profile.height?.unit === 'cm' ? profile.height.value : 
                                 profile.height?.feet && profile.height?.inches ? 
                                 UserProfileService.convertHeightToCm(profile.height.feet, profile.height.inches) : workoutPlanOptions.height;
        if (workoutHeightValue !== null) {
          setWorkoutPlanOptions(prev => ({
            ...prev,
            gender: profile.gender || prev.gender,
            current_weight: profile.weight?.value || prev.current_weight,
            weight_unit: profile.weight?.unit || prev.weight_unit,
            height: workoutHeightValue
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const templatesResponse = await getAITemplates();
      setTemplates(templatesResponse.templates);
    } catch (error) {
      console.error('Error loading AI planner data:', error);
      Alert.alert('Error', 'Failed to load AI planner data');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {


    try {
      setGenerating(true);
      let response: any;

      if (selectedPlanType === 'meal_plan') {
        const request: GenerateMealPlanRequest = {
          ...mealPlanOptions,
        };
        response = await generateMealPlan(request);
        Alert.alert('Success', 'Meal plan generated successfully!', [
          { text: 'Edit Plan', onPress: () => router.push('/my-meal-plans' as any) },
          { text: 'OK' },
        ]);
      } else {
        const request: GenerateWorkoutPlanRequest = {
          ...workoutPlanOptions,
        };
        response = await generateWorkoutPlan(request);
        Alert.alert('Success', 'Workout plan generated successfully!', [
          { text: 'Edit Plan', onPress: () => router.push('/my-workouts' as any) },
          { text: 'OK' },
        ]);
      }

    } catch (error) {
      console.error('Error generating plan:', error);
      Alert.alert('Error', 'Failed to generate plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const useTemplate = (template: Template) => {
    // TODO: Implement template usage with form fields
    // For now, just close the templates
    setShowTemplates(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'processing': return '#FF9800';
      case 'failed': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'processing': return 'time';
      case 'failed': return 'close-circle';
      default: return 'ellipse';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SubscriptionGuard>
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
          <ThemedText style={styles.title}>AI Planner</ThemedText>
          <ThemedText style={styles.subtitle}>Create personalized plans using form inputs</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/ai-generations')}
        >
          <Ionicons name="time-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Plan Type Selector */}
        <View style={styles.planTypeSelector}>
          <TouchableOpacity
            style={[
              styles.planTypeButton,
              {
                backgroundColor: selectedPlanType === 'meal_plan' ? primaryColor : cardBackground,
              },
            ]}
            onPress={() => setSelectedPlanType('meal_plan')}
          >
            <Ionicons
              name="restaurant"
              size={24}
              color={selectedPlanType === 'meal_plan' ? 'white' : textColor}
            />
            <ThemedText
              style={[
                styles.planTypeText,
                { color: selectedPlanType === 'meal_plan' ? 'white' : textColor },
              ]}
            >
              Meal Plan
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.planTypeButton,
              {
                backgroundColor: selectedPlanType === 'workout_plan' ? primaryColor : cardBackground,
              },
            ]}
            onPress={() => setSelectedPlanType('workout_plan')}
          >
            <Ionicons
              name="fitness"
              size={24}
              color={selectedPlanType === 'workout_plan' ? 'white' : textColor}
            />
            <ThemedText
              style={[
                styles.planTypeText,
                { color: selectedPlanType === 'workout_plan' ? 'white' : textColor },
              ]}
            >
              Workout Plan
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Templates Section */}
        <ThemedView style={[styles.templatesCard, { backgroundColor: cardBackground }]}>
          <View style={styles.templatesHeader}>
            <ThemedText style={styles.sectionTitle}>Quick Templates</ThemedText>
            <TouchableOpacity onPress={() => setShowTemplates(!showTemplates)}>
              <Ionicons
                name={showTemplates ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={textColor}
              />
            </TouchableOpacity>
          </View>
          {showTemplates && (
            <View style={styles.templatesList}>
              {templates
                .filter(template => template.template_type === selectedPlanType)
                .slice(0, 3)
                .map(template => (
                  <TouchableOpacity
                    key={template.id}
                    style={styles.templateItem}
                    onPress={() => useTemplate(template)}
                  >
                    <ThemedText style={styles.templateName}>{template.name}</ThemedText>
                    <ThemedText style={styles.templateDescription}>
                      {template.description}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </ThemedView>



        {/* Options Section */}
        <ThemedView style={[styles.optionsCard, { backgroundColor: cardBackground }]}>
          <View style={styles.optionsHeader}>
            <ThemedText style={styles.sectionTitle}>Basic Options</ThemedText>
            <TouchableOpacity 
              style={styles.advancedToggle}
              onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <ThemedText style={[styles.advancedToggleText, { color: primaryColor }]}>
                {showAdvancedOptions ? 'Hide' : 'Show'} Advanced
              </ThemedText>
              <Ionicons
                name={showAdvancedOptions ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={primaryColor}
              />
            </TouchableOpacity>
          </View>
          
          {selectedPlanType === 'meal_plan' ? (
            <View style={styles.optionsGrid}>
              <View style={styles.optionItem}>
                <ThemedText style={styles.optionLabel}>Goal</ThemedText>
                <View style={styles.optionButtons}>
                  {['weight_loss', 'muscle_gain', 'general_health'].map(goal => (
                    <TouchableOpacity
                      key={goal}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: mealPlanOptions.goal === goal ? primaryColor : backgroundColor,
                        },
                      ]}
                      onPress={() => setMealPlanOptions(prev => ({ ...prev, goal: goal as any }))}
                    >
                      <ThemedText
                        style={[
                          styles.optionButtonText,
                          { color: mealPlanOptions.goal === goal ? 'white' : textColor },
                        ]}
                      >
                        {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.optionItem}>
                <ThemedText style={styles.optionLabel}>Days</ThemedText>
                <View style={styles.optionButtons}>
                  {[3, 5, 7].map(days => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: mealPlanOptions.days === days ? primaryColor : backgroundColor,
                        },
                      ]}
                      onPress={() => setMealPlanOptions(prev => ({ ...prev, days }))}
                    >
                      <ThemedText
                        style={[
                          styles.optionButtonText,
                          { color: mealPlanOptions.days === days ? 'white' : textColor },
                        ]}
                      >
                        {days}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.optionItem}>
                <ThemedText style={styles.optionLabel}>Calories</ThemedText>
                <TextInput
                  style={[
                    styles.calorieInput,
                    {
                      backgroundColor: backgroundColor,
                      color: textColor,
                      borderColor: textColor + '20',
                    },
                  ]}
                  value={mealPlanOptions.calorie_target ? mealPlanOptions.calorie_target.toString() : ''}
                  onChangeText={(text) => {
                    if (text === '') {
                      setMealPlanOptions(prev => ({ ...prev, calorie_target: 0 }));
                    } else {
                      const value = parseInt(text) || 0;
                    setMealPlanOptions(prev => ({ ...prev, calorie_target: value }));
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="2000"
                  placeholderTextColor={textColor + '60'}
                />
              </View>

              <View style={styles.optionItem}>
                <ThemedText style={styles.optionLabel}>Dietary Restrictions</ThemedText>
                <View style={styles.optionButtons}>
                  {['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'keto', 'paleo', 'low_sodium', 'nut_free', 'shellfish_free', 'none'].map(restriction => (
                    <TouchableOpacity
                      key={restriction}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: mealPlanOptions.dietary_restrictions.includes(restriction) ? primaryColor : backgroundColor,
                        },
                      ]}
                      onPress={() => setMealPlanOptions(prev => ({
                        ...prev,
                        dietary_restrictions: prev.dietary_restrictions.includes(restriction)
                          ? prev.dietary_restrictions.filter(r => r !== restriction)
                          : [...prev.dietary_restrictions, restriction]
                      }))}
                    >
                      <ThemedText
                        style={[
                          styles.optionButtonText,
                          { color: mealPlanOptions.dietary_restrictions.includes(restriction) ? 'white' : textColor },
                        ]}
                      >
                        {restriction === 'none' ? 'None' : restriction.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.optionsGrid}>
              <View style={styles.optionItem}>
                <ThemedText style={styles.optionLabel}>Category</ThemedText>
                <View style={styles.optionButtons}>
                  {['strength_training', 'cardio', 'general_fitness'].map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: workoutPlanOptions.category === category ? primaryColor : backgroundColor,
                        },
                      ]}
                      onPress={() => setWorkoutPlanOptions(prev => ({ ...prev, category: category as any }))}
                    >
                      <ThemedText
                        style={[
                          styles.optionButtonText,
                          { color: workoutPlanOptions.category === category ? 'white' : textColor },
                        ]}
                      >
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.optionItem}>
                <ThemedText style={styles.optionLabel}>Difficulty</ThemedText>
                <View style={styles.optionButtons}>
                  {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: workoutPlanOptions.difficulty === difficulty ? primaryColor : backgroundColor,
                        },
                      ]}
                      onPress={() => setWorkoutPlanOptions(prev => ({ ...prev, difficulty: difficulty as any }))}
                    >
                      <ThemedText
                        style={[
                          styles.optionButtonText,
                          { color: workoutPlanOptions.difficulty === difficulty ? 'white' : textColor },
                        ]}
                      >
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.optionItem}>
                <ThemedText style={styles.optionLabel}>Days</ThemedText>
                <View style={styles.optionButtons}>
                  {[3, 4, 5, 6].map(days => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: workoutPlanOptions.days === days ? primaryColor : backgroundColor,
                        },
                      ]}
                      onPress={() => setWorkoutPlanOptions(prev => ({ ...prev, days }))}
                    >
                      <ThemedText
                        style={[
                          styles.optionButtonText,
                          { color: workoutPlanOptions.days === days ? 'white' : textColor },
                        ]}
                      >
                        {days}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.optionItem}>
                <ThemedText style={styles.optionLabel}>Focus Areas</ThemedText>
                <View style={styles.optionButtons}>
                  {['upper_body', 'lower_body', 'core', 'full_body', 'cardio', 'strength', 'flexibility', 'balance', 'endurance'].map(area => (
                    <TouchableOpacity
                      key={area}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: workoutPlanOptions.focus_areas.includes(area) ? primaryColor : backgroundColor,
                        },
                      ]}
                      onPress={() => setWorkoutPlanOptions(prev => ({
                        ...prev,
                        focus_areas: prev.focus_areas.includes(area)
                          ? prev.focus_areas.filter(a => a !== area)
                          : [...prev.focus_areas, area]
                      }))}
                    >
                      <ThemedText
                        style={[
                          styles.optionButtonText,
                          { color: workoutPlanOptions.focus_areas.includes(area) ? 'white' : textColor },
                        ]}
                      >
                        {area.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.optionItem}>
                <ThemedText style={styles.optionLabel}>Equipment</ThemedText>
                <View style={styles.optionButtons}>
                  {['dumbbells', 'barbell', 'resistance_bands', 'bodyweight', 'cardio_machine', 'yoga_mat', 'kettlebell', 'none'].map(equipment => (
                    <TouchableOpacity
                      key={equipment}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: workoutPlanOptions.equipment.includes(equipment) ? primaryColor : backgroundColor,
                        },
                      ]}
                      onPress={() => setWorkoutPlanOptions(prev => ({
                        ...prev,
                        equipment: prev.equipment.includes(equipment)
                          ? prev.equipment.filter(e => e !== equipment)
                          : [...prev.equipment, equipment]
                      }))}
                    >
                      <ThemedText
                        style={[
                          styles.optionButtonText,
                          { color: workoutPlanOptions.equipment.includes(equipment) ? 'white' : textColor },
                        ]}
                      >
                        {equipment === 'none' ? 'None' : equipment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ThemedView>

        {/* Advanced Options Section */}
        {showAdvancedOptions && (
          <ThemedView style={[styles.advancedOptionsCard, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles.sectionTitle}>Advanced Fitness Parameters</ThemedText>
            
            {selectedPlanType === 'meal_plan' ? (
              <View style={styles.advancedOptionsGrid}>
                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Age</ThemedText>
                    <TextInput
                      style={[
                        styles.numberInput,
                        {
                          backgroundColor: backgroundColor,
                          color: textColor,
                          borderColor: textColor + '20',
                        },
                      ]}
                      value={mealPlanOptions.age ? mealPlanOptions.age.toString() : ''}
                      onChangeText={(text) => {
                        if (text === '') {
                          setMealPlanOptions(prev => ({ ...prev, age: 0 }));
                        } else {
                          const value = parseInt(text) || 0;
                          setMealPlanOptions(prev => ({ ...prev, age: value }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="25"
                      placeholderTextColor={textColor + '60'}
                    />
                  </View>
                  
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Gender</ThemedText>
                    <View style={styles.optionButtons}>
                      {['male', 'female', 'not_specified'].map(gender => (
        <TouchableOpacity
                          key={gender}
          style={[
                            styles.optionButton,
                            {
                              backgroundColor: mealPlanOptions.gender === gender ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => setMealPlanOptions(prev => ({ ...prev, gender: gender as any }))}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: mealPlanOptions.gender === gender ? 'white' : textColor },
                            ]}
                          >
                            {gender === 'not_specified' ? 'Not Specified' : gender.charAt(0).toUpperCase() + gender.slice(1)}
          </ThemedText>
        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Weight Unit</ThemedText>
                    <View style={styles.optionButtons}>
                      {['kg', 'lbs'].map(unit => (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: mealPlanOptions.weight_unit === unit ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => {
                            const newUnit = unit as 'kg' | 'lbs';
                            setMealPlanOptions(prev => {
                              let newCurrentWeight = prev.current_weight;
                              let newTargetWeight = prev.target_weight;
                              
                              if (prev.weight_unit === 'kg' && newUnit === 'lbs') {
                                newCurrentWeight = UserProfileService.convertKgToLbs(prev.current_weight);
                                newTargetWeight = UserProfileService.convertKgToLbs(prev.target_weight);
                              } else if (prev.weight_unit === 'lbs' && newUnit === 'kg') {
                                newCurrentWeight = UserProfileService.convertWeightToKg(prev.current_weight);
                                newTargetWeight = UserProfileService.convertWeightToKg(prev.target_weight);
                              }
                              
                              return {
                                ...prev,
                                weight_unit: newUnit,
                                current_weight: Math.round(newCurrentWeight * 10) / 10,
                                target_weight: Math.round(newTargetWeight * 10) / 10,
                              };
                            });
                          }}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: mealPlanOptions.weight_unit === unit ? 'white' : textColor },
                            ]}
                          >
                            {unit.toUpperCase()}
                </ThemedText>
              </TouchableOpacity>
                      ))}
            </View>
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Current Weight ({mealPlanOptions.weight_unit})</ThemedText>
                    <TextInput
                      style={[
                        styles.numberInput,
                        {
                          backgroundColor: backgroundColor,
                          color: textColor,
                          borderColor: textColor + '20',
                        },
                      ]}
                      value={mealPlanOptions.current_weight ? mealPlanOptions.current_weight.toString() : ''}
                      onChangeText={(text) => {
                        if (text === '') {
                          setMealPlanOptions(prev => ({ ...prev, current_weight: 0 }));
                        } else {
                          const value = parseFloat(text) || 0;
                          setMealPlanOptions(prev => ({ ...prev, current_weight: value }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="70"
                      placeholderTextColor={textColor + '60'}
                    />
                  </View>
                  
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Target Weight ({mealPlanOptions.weight_unit})</ThemedText>
                    <TextInput
                      style={[
                        styles.numberInput,
                        {
                          backgroundColor: backgroundColor,
                          color: textColor,
                          borderColor: textColor + '20',
                        },
                      ]}
                      value={mealPlanOptions.target_weight ? mealPlanOptions.target_weight.toString() : ''}
                      onChangeText={(text) => {
                        if (text === '') {
                          setMealPlanOptions(prev => ({ ...prev, target_weight: 0 }));
                        } else {
                          const value = parseFloat(text) || 0;
                          setMealPlanOptions(prev => ({ ...prev, target_weight: value }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="70"
                      placeholderTextColor={textColor + '60'}
                    />
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Height (cm)</ThemedText>
                    <TextInput
                      style={[
                        styles.numberInput,
                        {
                          backgroundColor: backgroundColor,
                          color: textColor,
                          borderColor: textColor + '20',
                        },
                      ]}
                      value={mealPlanOptions.height ? mealPlanOptions.height.toString() : ''}
                      onChangeText={(text) => {
                        if (text === '') {
                          setMealPlanOptions(prev => ({ ...prev, height: 0 }));
                        } else {
                          const value = parseInt(text) || 0;
                          setMealPlanOptions(prev => ({ ...prev, height: value }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="170"
                      placeholderTextColor={textColor + '60'}
                    />
                  </View>
                  
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Activity Level</ThemedText>
                    <View style={styles.optionButtons}>
                      {['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'].map(level => (
                                  <TouchableOpacity
                          key={level}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: mealPlanOptions.activity_level === level ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => setMealPlanOptions(prev => ({ ...prev, activity_level: level as any }))}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: mealPlanOptions.activity_level === level ? 'white' : textColor },
                            ]}
                          >
                            {level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Fitness Experience</ThemedText>
                    <View style={styles.optionButtons}>
                      {['beginner', 'intermediate', 'advanced'].map(experience => (
                        <TouchableOpacity
                          key={experience}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: mealPlanOptions.fitness_experience === experience ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => setMealPlanOptions(prev => ({ ...prev, fitness_experience: experience as any }))}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: mealPlanOptions.fitness_experience === experience ? 'white' : textColor },
                            ]}
                          >
                            {experience.charAt(0).toUpperCase() + experience.slice(1)}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Time Constraints</ThemedText>
                    <View style={styles.optionButtons}>
                      {['quick_meals', 'meal_prep_friendly', 'budget_friendly', 'gourmet', 'family_sized', 'single_serving'].map(constraint => (
                        <TouchableOpacity
                          key={constraint}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: mealPlanOptions.time_constraints.includes(constraint) ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => setMealPlanOptions(prev => ({
                            ...prev,
                            time_constraints: prev.time_constraints.includes(constraint)
                              ? prev.time_constraints.filter(c => c !== constraint)
                              : [...prev.time_constraints, constraint]
                          }))}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: mealPlanOptions.time_constraints.includes(constraint) ? 'white' : textColor },
                            ]}
                          >
                            {constraint.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Preferences</ThemedText>
                    <View style={styles.optionButtons}>
                      {['high_protein', 'low_carb', 'organic', 'seasonal', 'international', 'budget_friendly'].map(preference => (
                        <TouchableOpacity
                          key={preference}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: mealPlanOptions.preferences.includes(preference) ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => setMealPlanOptions(prev => ({
                            ...prev,
                            preferences: prev.preferences.includes(preference)
                              ? prev.preferences.filter(p => p !== preference)
                              : [...prev.preferences, preference]
                          }))}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: mealPlanOptions.preferences.includes(preference) ? 'white' : textColor },
                            ]}
                          >
                            {preference.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.advancedOptionsGrid}>
                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Age</ThemedText>
                    <TextInput
                      style={[
                        styles.numberInput,
                        {
                          backgroundColor: backgroundColor,
                          color: textColor,
                          borderColor: textColor + '20',
                        },
                      ]}
                      value={workoutPlanOptions.age ? workoutPlanOptions.age.toString() : ''}
                      onChangeText={(text) => {
                        if (text === '') {
                          setWorkoutPlanOptions(prev => ({ ...prev, age: 0 }));
                        } else {
                          const value = parseInt(text) || 0;
                          setWorkoutPlanOptions(prev => ({ ...prev, age: value }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="25"
                      placeholderTextColor={textColor + '60'}
                    />
                  </View>
                  
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Gender</ThemedText>
                    <View style={styles.optionButtons}>
                      {['male', 'female', 'not_specified'].map(gender => (
                        <TouchableOpacity
                          key={gender}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: workoutPlanOptions.gender === gender ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => setWorkoutPlanOptions(prev => ({ ...prev, gender: gender as any }))}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: workoutPlanOptions.gender === gender ? 'white' : textColor },
                            ]}
                          >
                            {gender === 'not_specified' ? 'Not Specified' : gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Weight Unit</ThemedText>
                    <View style={styles.optionButtons}>
                      {['kg', 'lbs'].map(unit => (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: workoutPlanOptions.weight_unit === unit ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => {
                            const newUnit = unit as 'kg' | 'lbs';
                            setWorkoutPlanOptions(prev => {
                              let newCurrentWeight = prev.current_weight;
                              let newTargetWeight = prev.target_weight;
                              
                              if (prev.weight_unit === 'kg' && newUnit === 'lbs') {
                                newCurrentWeight = UserProfileService.convertKgToLbs(prev.current_weight);
                                newTargetWeight = UserProfileService.convertKgToLbs(prev.target_weight);
                              } else if (prev.weight_unit === 'lbs' && newUnit === 'kg') {
                                newCurrentWeight = UserProfileService.convertWeightToKg(prev.current_weight);
                                newTargetWeight = UserProfileService.convertWeightToKg(prev.target_weight);
                              }
                              
                              return {
                                ...prev,
                                weight_unit: newUnit,
                                current_weight: Math.round(newCurrentWeight * 10) / 10,
                                target_weight: Math.round(newTargetWeight * 10) / 10,
                              };
                            });
                          }}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: workoutPlanOptions.weight_unit === unit ? 'white' : textColor },
                            ]}
                          >
                            {unit.toUpperCase()}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Current Weight ({workoutPlanOptions.weight_unit})</ThemedText>
                    <TextInput
                      style={[
                        styles.numberInput,
                        {
                          backgroundColor: backgroundColor,
                          color: textColor,
                          borderColor: textColor + '20',
                        },
                      ]}
                      value={workoutPlanOptions.current_weight ? workoutPlanOptions.current_weight.toString() : ''}
                      onChangeText={(text) => {
                        if (text === '') {
                          setWorkoutPlanOptions(prev => ({ ...prev, current_weight: 0 }));
                        } else {
                          const value = parseFloat(text) || 0;
                          setWorkoutPlanOptions(prev => ({ ...prev, current_weight: value }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="70"
                      placeholderTextColor={textColor + '60'}
                      />
                    </View>
                  
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Target Weight ({workoutPlanOptions.weight_unit})</ThemedText>
                    <TextInput
                      style={[
                        styles.numberInput,
                        {
                          backgroundColor: backgroundColor,
                          color: textColor,
                          borderColor: textColor + '20',
                        },
                      ]}
                      value={workoutPlanOptions.target_weight ? workoutPlanOptions.target_weight.toString() : ''}
                      onChangeText={(text) => {
                        if (text === '') {
                          setWorkoutPlanOptions(prev => ({ ...prev, target_weight: 0 }));
                        } else {
                          const value = parseFloat(text) || 0;
                          setWorkoutPlanOptions(prev => ({ ...prev, target_weight: value }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="70"
                      placeholderTextColor={textColor + '60'}
                    />
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Height (cm)</ThemedText>
                    <TextInput
                      style={[
                        styles.numberInput,
                        {
                          backgroundColor: backgroundColor,
                          color: textColor,
                          borderColor: textColor + '20',
                        },
                      ]}
                      value={workoutPlanOptions.height ? workoutPlanOptions.height.toString() : ''}
                      onChangeText={(text) => {
                        if (text === '') {
                          setWorkoutPlanOptions(prev => ({ ...prev, height: 0 }));
                        } else {
                          const value = parseInt(text) || 0;
                          setWorkoutPlanOptions(prev => ({ ...prev, height: value }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="170"
                      placeholderTextColor={textColor + '60'}
                    />
                  </View>
                  
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Activity Level</ThemedText>
                    <View style={styles.optionButtons}>
                      {['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'].map(level => (
                        <TouchableOpacity
                          key={level}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: workoutPlanOptions.activity_level === level ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => setWorkoutPlanOptions(prev => ({ ...prev, activity_level: level as any }))}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: workoutPlanOptions.activity_level === level ? 'white' : textColor },
                            ]}
                          >
                            {level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Fitness Experience</ThemedText>
                    <View style={styles.optionButtons}>
                      {['beginner', 'intermediate', 'advanced'].map(experience => (
                        <TouchableOpacity
                          key={experience}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: workoutPlanOptions.fitness_experience === experience ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => setWorkoutPlanOptions(prev => ({ ...prev, fitness_experience: experience as any }))}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: workoutPlanOptions.fitness_experience === experience ? 'white' : textColor },
                            ]}
                          >
                            {experience.charAt(0).toUpperCase() + experience.slice(1)}
                    </ThemedText>
                        </TouchableOpacity>
                      ))}
                  </View>
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Time Constraints</ThemedText>
                    <View style={styles.optionButtons}>
                      {['30_min_sessions', 'morning_workouts', 'evening_workouts', 'weekend_only', 'quick_workouts'].map(constraint => (
                        <TouchableOpacity
                          key={constraint}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: workoutPlanOptions.time_constraints.includes(constraint) ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => setWorkoutPlanOptions(prev => ({
                            ...prev,
                            time_constraints: prev.time_constraints.includes(constraint)
                              ? prev.time_constraints.filter(c => c !== constraint)
                              : [...prev.time_constraints, constraint]
                          }))}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: workoutPlanOptions.time_constraints.includes(constraint) ? 'white' : textColor },
                            ]}
                          >
                            {constraint.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Injuries & Limitations</ThemedText>
                    <View style={styles.optionButtons}>
                      {['knee_injury', 'back_pain', 'shoulder_issues', 'ankle_problems', 'none'].map(limitation => (
                        <TouchableOpacity
                          key={limitation}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: workoutPlanOptions.injuries_limitations.includes(limitation) ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => setWorkoutPlanOptions(prev => ({
                            ...prev,
                            injuries_limitations: prev.injuries_limitations.includes(limitation)
                              ? prev.injuries_limitations.filter(l => l !== limitation)
                              : [...prev.injuries_limitations, limitation]
                          }))}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: workoutPlanOptions.injuries_limitations.includes(limitation) ? 'white' : textColor },
                            ]}
                          >
                            {limitation === 'none' ? 'None' : limitation.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.advancedOptionRow}>
                  <View style={styles.advancedOptionItem}>
                    <ThemedText style={styles.optionLabel}>Workout Preferences</ThemedText>
                    <View style={styles.optionButtons}>
                      {['outdoor', 'group', 'solo', 'progressive_overload', 'variety', 'low_impact', 'high_intensity'].map(preference => (
                        <TouchableOpacity
                          key={preference}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: workoutPlanOptions.workout_preferences.includes(preference) ? primaryColor : backgroundColor,
                            },
                          ]}
                          onPress={() => setWorkoutPlanOptions(prev => ({
                            ...prev,
                            workout_preferences: prev.workout_preferences.includes(preference)
                              ? prev.workout_preferences.filter(p => p !== preference)
                              : [...prev.workout_preferences, preference]
                          }))}
                        >
                          <ThemedText
                            style={[
                              styles.optionButtonText,
                              { color: workoutPlanOptions.workout_preferences.includes(preference) ? 'white' : textColor },
                            ]}
                          >
                            {preference.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ThemedView>
        )}

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            {
              backgroundColor: generating ? primaryColor + '80' : primaryColor,
              opacity: generating ? 0.8 : 1,
            },
          ]}
          onPress={handleGeneratePlan}
          disabled={generating}
        >
          {generating ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner size="small" color="white" />
            </View>
          ) : (
            <Ionicons name="sparkles" size={24} color="white" />
          )}
          <ThemedText style={[styles.generateButtonText, { opacity: generating ? 0.9 : 1 }]}>
            {generating ? 'Generating Plan...' : 'Generate Plan'}
          </ThemedText>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
    </SubscriptionGuard>
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
    minHeight: 56,
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
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  historyButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  scrollView: {
    flex: 1,
    paddingTop: 0,
  },
  planTypeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  planTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planTypeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  templatesCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  templatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  templatesList: {
    gap: 12,
  },
  templateItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  promptCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 8,
  },
  promptHint: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  optionsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionsGrid: {
    gap: 20,
  },
  optionItem: {
    gap: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  optionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  calorieInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    width: 120,
  },
  advancedOptionsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  advancedOptionsGrid: {
    gap: 20,
  },
  advancedOptionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  advancedOptionItem: {
    flex: 1,
    gap: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minWidth: 80,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 