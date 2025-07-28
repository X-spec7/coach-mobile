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
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { WorkoutService, CreateWorkoutPlanRequest } from '../services/workoutService';

interface CreateWorkoutPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateWorkoutPlanModal: React.FC<CreateWorkoutPlanModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const colorScheme = useColorScheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a workout plan title');
      return;
    }

    setLoading(true);
    try {
      const data: CreateWorkoutPlanRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
      };

      await WorkoutService.createWorkoutPlan(data);
      Alert.alert('Success', 'Workout plan created successfully!');
      setTitle('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating workout plan:', error);
      Alert.alert('Error', 'Failed to create workout plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
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
              Create Workout Plan
            </Text>
            <TouchableOpacity onPress={handleCreate} disabled={loading || !title.trim()}>
              {loading ? (
                <ActivityIndicator size="small" color="#A78BFA" />
              ) : (
                <Text
                  style={[
                    styles.createText,
                    (!title.trim() || loading) && styles.disabledText
                  ]}
                >
                  Create
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}
              >
                Title *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20',
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].tabIconDefault + '40',
                  }
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter workout plan title"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                editable={!loading}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}
              >
                Description
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20',
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].tabIconDefault + '40',
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter workout plan description (optional)"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
                maxLength={500}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    maxHeight: '80%',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
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
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
  },
}); 