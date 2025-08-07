import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { MealService, CreateMealPlanRequest, MealPlanGoal } from '../services/mealService';

interface CreateMealPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const GOAL_OPTIONS: { key: MealPlanGoal; label: string; description: string }[] = [
  { key: 'general_health', label: 'General Health', description: 'Balanced nutrition for overall wellness' },
  { key: 'weight_loss', label: 'Weight Loss', description: 'Reduce calories for healthy weight loss' },
  { key: 'weight_gain', label: 'Weight Gain', description: 'Increase calories for healthy weight gain' },
  { key: 'muscle_gain', label: 'Muscle Gain', description: 'High protein for muscle building' },
  { key: 'maintenance', label: 'Maintenance', description: 'Maintain current weight and health' },
  { key: 'athletic_performance', label: 'Athletic Performance', description: 'Optimize nutrition for sports' },
];

export const CreateMealPlanModal: React.FC<CreateMealPlanModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const colorScheme = useColorScheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<MealPlanGoal>('general_health');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const data: CreateMealPlanRequest = {
        title: title.trim() || 'My Meal Plan',
        description: description.trim() || undefined,
        goal: selectedGoal,
      };

      console.log('[CreateMealPlan] Creating with data:', data);
      await MealService.createMealPlan(data);
      
      Alert.alert('Success', 'Meal plan created successfully!');
      setTitle('');
      setDescription('');
      setSelectedGoal('general_health');
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error creating meal plan:', error);
      Alert.alert('Error', 'Failed to create meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setSelectedGoal('general_health');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: Colors[colorScheme ?? 'light'].background }
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Text style={[styles.cancelText, loading && styles.disabledText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.title,
                { color: Colors[colorScheme ?? 'light'].text }
              ]}
            >
              Create Meal Plan
            </Text>
            <TouchableOpacity onPress={handleCreate} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#A78BFA" />
              ) : (
                <Text
                  style={[
                    styles.createText,
                    loading && styles.disabledText
                  ]}
                >
                  Create
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Title
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
                  }
                ]}
                placeholder="My Meal Plan"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={title}
                onChangeText={setTitle}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Description (Optional)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
                  }
                ]}
                placeholder="Describe your meal plan goals..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Goal
              </Text>
              {GOAL_OPTIONS.map((goal) => (
                <TouchableOpacity
                  key={goal.key}
                  style={[
                    styles.goalOption,
                    {
                      borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
                      backgroundColor: selectedGoal === goal.key 
                        ? 'rgba(167, 139, 250, 0.1)' 
                        : 'transparent',
                    }
                  ]}
                  onPress={() => setSelectedGoal(goal.key)}
                  disabled={loading}
                >
                  <View style={styles.goalOptionContent}>
                    <View style={styles.goalOptionHeader}>
                      <Text style={[
                        styles.goalOptionTitle,
                        { color: Colors[colorScheme ?? 'light'].text }
                      ]}>
                        {goal.label}
                      </Text>
                      <View style={[
                        styles.radioButton,
                        {
                          borderColor: selectedGoal === goal.key ? '#A78BFA' : Colors[colorScheme ?? 'light'].tabIconDefault,
                          backgroundColor: selectedGoal === goal.key ? '#A78BFA' : 'transparent',
                        }
                      ]}>
                        {selectedGoal === goal.key && (
                          <Ionicons name="checkmark" size={12} color="white" />
                        )}
                      </View>
                    </View>
                    <Text style={[
                      styles.goalOptionDescription,
                      { color: Colors[colorScheme ?? 'light'].tabIconDefault }
                    ]}>
                      {goal.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 34, // Safe area padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 16,
    color: '#888',
  },
  createText: {
    fontSize: 16,
    color: '#A78BFA',
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  goalOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  goalOptionContent: {
    flex: 1,
  },
  goalOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  goalOptionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});