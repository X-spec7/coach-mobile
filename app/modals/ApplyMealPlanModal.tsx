import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/Colors';
import { MealService, MealPlan } from '../services/mealService';

interface ApplyMealPlanModalProps {
  visible: boolean;
  onClose: () => void;
  mealPlan: MealPlan | null;
  onSuccess: () => void;
}

type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const WEEKDAYS: { key: WeekDay; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export const ApplyMealPlanModal: React.FC<ApplyMealPlanModalProps> = ({
  visible,
  onClose,
  mealPlan,
  onSuccess,
}) => {
  const colorScheme = useColorScheme();
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>([]);
  const [weeksCount, setWeeksCount] = useState('4');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [applying, setApplying] = useState(false);

  const resetForm = () => {
    setSelectedDays([]);
    setWeeksCount('4');
    setStartDate(new Date());
    setShowDatePicker(false);
    setApplying(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleDay = (day: WeekDay) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleApply = async () => {
    if (!mealPlan) return;

    // Validation
    if (selectedDays.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one day of the week.');
      return;
    }

    const weeks = parseInt(weeksCount);
    if (isNaN(weeks) || weeks < 1 || weeks > 52) {
      Alert.alert('Validation Error', 'Please enter a valid number of weeks (1-52).');
      return;
    }

    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      Alert.alert('Validation Error', 'Start date cannot be in the past.');
      return;
    }

    setApplying(true);
    try {
      await MealService.applyMealPlan({
        meal_plan_id: mealPlan.id,
        selected_days: selectedDays,
        weeks_count: weeks,
        start_date: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      });

      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error applying meal plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply meal plan';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('Authentication required, user will be redirected to login');
        onClose();
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setApplying(false);
    }
  };

  const getTotalMeals = () => {
    const weeks = parseInt(weeksCount) || 0;
    return selectedDays.length * weeks;
  };

  if (!mealPlan) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Apply Meal Plan
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Meal Plan Info */}
            <View style={styles.planInfo}>
              <Text style={[styles.planTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                {mealPlan.title}
              </Text>
              <Text style={styles.planCreator}>by {mealPlan.created_by_name}</Text>
              {mealPlan.description && (
                <Text style={styles.planDescription}>
                  {mealPlan.description}
                </Text>
              )}
              <View style={styles.planStats}>
                <View style={styles.statItem}>
                  <Ionicons name="calendar" size={16} color="#A78BFA" />
                  <Text style={styles.statText}>{mealPlan.daily_plans?.length || 0} days</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="flame" size={16} color="#A78BFA" />
                  <Text style={styles.statText}>{mealPlan.total_calories} cal</Text>
                </View>
              </View>
            </View>

            {/* Select Days */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Select Days of the Week
              </Text>
              <Text style={styles.sectionDescription}>
                Choose which days you want to follow this meal plan
              </Text>
              <View style={styles.daysContainer}>
                {WEEKDAYS.map((day) => (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day.key) && styles.dayButtonSelected,
                    ]}
                    onPress={() => toggleDay(day.key)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      selectedDays.includes(day.key) && styles.dayButtonTextSelected,
                    ]}>
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Number of Weeks */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Number of Weeks
              </Text>
              <Text style={styles.sectionDescription}>
                How many weeks do you want to follow this plan?
              </Text>
              <View style={styles.weeksContainer}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => {
                    const current = parseInt(weeksCount) || 1;
                    if (current > 1) setWeeksCount((current - 1).toString());
                  }}
                >
                  <Ionicons name="remove" size={20} color="#A78BFA" />
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.weeksInput,
                    {
                      backgroundColor: Colors[colorScheme ?? 'light'].background,
                      color: Colors[colorScheme ?? 'light'].text,
                      borderColor: Colors[colorScheme ?? 'light'].text,
                    },
                  ]}
                  value={weeksCount}
                  onChangeText={setWeeksCount}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => {
                    const current = parseInt(weeksCount) || 1;
                    if (current < 52) setWeeksCount((current + 1).toString());
                  }}
                >
                  <Ionicons name="add" size={20} color="#A78BFA" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Start Date */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Start Date
              </Text>
              <Text style={styles.sectionDescription}>
                When do you want to start this meal plan?
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: Colors[colorScheme ?? 'light'].text }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#A78BFA" />
                <Text style={[styles.dateText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {formatDate(startDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Summary */}
            {selectedDays.length > 0 && (
              <View style={styles.summary}>
                <Text style={[styles.summaryTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Summary
                </Text>
                <Text style={styles.summaryText}>
                  You'll have {getTotalMeals()} meal days over {weeksCount} weeks
                </Text>
                <Text style={styles.summaryText}>
                  Following the plan on: {selectedDays.map(day => 
                    WEEKDAYS.find(d => d.key === day)?.label
                  ).join(', ')}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.applyButton, applying && styles.applyButtonDisabled]} 
              onPress={handleApply}
              disabled={applying}
            >
              <Text style={styles.applyButtonText}>
                {applying ? 'Applying...' : 'Apply Plan'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setStartDate(selectedDate);
                }
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: 500,
  },
  planInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planCreator: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  planStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  weeksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A78BFA20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weeksInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
  },
  summary: {
    padding: 20,
    backgroundColor: '#A78BFA10',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#666',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});