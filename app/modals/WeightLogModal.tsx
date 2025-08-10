import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeightTrackingService, WeightEntry, CreateWeightEntryRequest, UpdateWeightEntryRequest } from '../services/weightTrackingService';

interface WeightLogModalProps {
  visible: boolean;
  onClose: () => void;
  onWeightLogged?: () => void;
  editingEntry?: WeightEntry | null;
}

export const WeightLogModal: React.FC<WeightLogModalProps> = ({
  visible,
  onClose,
  onWeightLogged,
  editingEntry,
}) => {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [notes, setNotes] = useState('');

  const isEditing = !!editingEntry;

  useEffect(() => {
    if (visible) {
      if (isEditing && editingEntry) {
        // Editing existing entry
        setDate(editingEntry.date);
        setWeightValue(editingEntry.weight_value);
        setUnit(editingEntry.unit);
        setNotes(editingEntry.notes || '');
      } else {
        // Creating new entry - set today's date
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
        setWeightValue('');
        setUnit('kg');
        setNotes('');
      }
    }
  }, [visible, editingEntry, isEditing]);

  const validateForm = (): boolean => {
    if (!date) {
      Alert.alert('Error', 'Please select a date');
      return false;
    }

    if (!weightValue || weightValue.trim() === '') {
      Alert.alert('Error', 'Please enter your weight');
      return false;
    }

    const weight = parseFloat(weightValue);
    if (isNaN(weight) || weight < 30 || weight > 300) {
      Alert.alert('Error', 'Weight must be between 30 and 300');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const weight = parseFloat(weightValue);

      if (isEditing && editingEntry) {
        // Update existing entry
        const updateData: UpdateWeightEntryRequest = {
          weight_value: weight,
          unit,
          notes: notes.trim() || undefined,
        };

        await WeightTrackingService.updateWeightEntry(editingEntry.id, updateData);
        Alert.alert('Success', 'Weight entry updated successfully!');
      } else {
        // Create new entry
        const createData: CreateWeightEntryRequest = {
          date,
          weight_value: weight,
          unit,
          notes: notes.trim() || undefined,
        };

        await WeightTrackingService.createWeightEntry(createData);
        Alert.alert('Success', 'Weight logged successfully!');
      }

      onWeightLogged?.();
      onClose();
    } catch (error) {
      console.error('Error logging weight:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to log weight';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEntry) return;

    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this weight entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await WeightTrackingService.deleteWeightEntry(editingEntry.id);
              Alert.alert('Success', 'Weight entry deleted successfully!');
              onWeightLogged?.();
              onClose();
            } catch (error) {
              console.error('Error deleting weight entry:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to delete weight entry';
              Alert.alert('Error', errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Weight Entry' : 'Log Weight'}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Date Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                editable={!isEditing} // Can't change date when editing
              />
              {isEditing && (
                <Text style={styles.helperText}>Date cannot be changed for existing entries</Text>
              )}
            </View>

            {/* Weight Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Weight *</Text>
              <View style={styles.weightInputContainer}>
                <TextInput
                  style={[styles.input, styles.weightInput]}
                  value={weightValue}
                  onChangeText={setWeightValue}
                  placeholder="75.5"
                  keyboardType="numeric"
                  maxLength={6}
                />
                <View style={styles.unitSelector}>
                  <TouchableOpacity
                    style={[
                      styles.unitButton,
                      unit === 'kg' && styles.unitButtonActive,
                    ]}
                    onPress={() => setUnit('kg')}
                  >
                    <Text
                      style={[
                        styles.unitButtonText,
                        unit === 'kg' && styles.unitButtonTextActive,
                      ]}
                    >
                      kg
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.unitButton,
                      unit === 'lbs' && styles.unitButtonActive,
                    ]}
                    onPress={() => setUnit('lbs')}
                  >
                    <Text
                      style={[
                        styles.unitButtonText,
                        unit === 'lbs' && styles.unitButtonTextActive,
                      ]}
                    >
                      lbs
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.helperText}>Enter weight between 30-300 {unit}</Text>
            </View>

            {/* Notes Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g., After morning workout, before breakfast..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={200}
              />
              <Text style={styles.helperText}>{notes.length}/200 characters</Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {isEditing && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
                disabled={loading}
              >
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Update' : 'Log Weight'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weightInput: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unitButtonActive: {
    backgroundColor: '#A78BFA',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  unitButtonTextActive: {
    color: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButton: {
    backgroundColor: '#A78BFA',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WeightLogModal; 