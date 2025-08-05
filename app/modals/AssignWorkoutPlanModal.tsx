import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutService, AssignWorkoutPlanRequest } from '../services/workoutService';
import { CoachClientService, Client } from '../services/coachClientService';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../constants/api';

interface AssignWorkoutPlanModalProps {
  visible: boolean;
  onClose: () => void;
  workoutPlanId: string;
  workoutPlanTitle: string;
  onSuccess?: () => void;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const AssignWorkoutPlanModal: React.FC<AssignWorkoutPlanModalProps> = ({
  visible,
  onClose,
  workoutPlanId,
  workoutPlanTitle,
  onSuccess,
}) => {
  const { user } = useAuth();
  
  // Debug: Check if API endpoints are properly imported
  console.log('[AssignWorkoutPlanModal] API_ENDPOINTS check:', {
    ASSIGN_WORKOUT_PLAN: API_ENDPOINTS?.WORKOUTS?.ASSIGN_WORKOUT_PLAN,
    hasWorkouts: !!API_ENDPOINTS?.WORKOUTS,
    allEndpoints: Object.keys(API_ENDPOINTS?.WORKOUTS || {}),
  });
  
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [weeksCount, setWeeksCount] = useState<string>('4');
  const [suggestedStartDate, setSuggestedStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [step, setStep] = useState<'select-client' | 'configure'>('select-client');

  useEffect(() => {
    if (visible) {
      fetchClients();
      // Set default dates
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      setSuggestedStartDate(tomorrow.toISOString().split('T')[0]);
      setDueDate(nextWeek.toISOString().split('T')[0]);
    } else {
      // Reset form when modal closes
      setSelectedClient(null);
      setSelectedDays([]);
      setWeeksCount('4');
      setNotes('');
      setStep('select-client');
    }
  }, [visible]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await CoachClientService.getMyRelationships({ status: 'active' });
      if (user?.userType === 'Coach') {
        // For coaches, get the clients from relationships
        const activeClients = response.relationships
          .filter(rel => rel.status === 'active')
          .map(rel => rel.client) as Client[];
        setClients(activeClients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      Alert.alert('Error', 'Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setStep('configure');
  };

  const handleBackToClientSelection = () => {
    setStep('select-client');
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleAssign = async () => {
    if (!selectedClient || selectedDays.length === 0 || !weeksCount) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const weeks = parseInt(weeksCount);
    if (isNaN(weeks) || weeks < 1 || weeks > 52) {
      Alert.alert('Error', 'Please enter a valid number of weeks (1-52).');
      return;
    }

    const startDate = new Date(suggestedStartDate);
    const endDate = new Date(dueDate);
    if (endDate <= startDate) {
      Alert.alert('Error', 'Due date must be after the suggested start date.');
      return;
    }

    setLoading(true);
    try {
      const assignmentData: AssignWorkoutPlanRequest = {
        client_id: selectedClient.id,
        workout_plan_id: workoutPlanId,
        selected_days: selectedDays,
        weeks_count: weeks,
        start_date: suggestedStartDate,
        suggested_start_date: suggestedStartDate,
        due_date: dueDate,
        notes: notes.trim() || undefined,
      };

      console.log('[AssignWorkoutPlan] Assignment data:', JSON.stringify(assignmentData, null, 2));
      console.log('[AssignWorkoutPlan] API endpoint:', API_ENDPOINTS.WORKOUTS.ASSIGN_WORKOUT_PLAN);
      
      await WorkoutService.assignWorkoutPlan(assignmentData);
      
      Alert.alert(
        'Success',
        `Workout plan "${workoutPlanTitle}" has been assigned to ${selectedClient.fullName}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error assigning workout plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign workout plan';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderClientSelection = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Select Client</Text>
      <Text style={styles.subtitle}>
        Choose which client to assign "{workoutPlanTitle}" to:
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Loading clients...</Text>
        </View>
      ) : clients.length > 0 ? (
        <ScrollView style={styles.clientsList}>
          {clients.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientCard}
              onPress={() => handleSelectClient(client)}
            >
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client.fullName}</Text>
                <Text style={styles.clientEmail}>{client.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Active Clients</Text>
          <Text style={styles.emptyStateText}>
            You need to have active client relationships to assign workout plans.
          </Text>
        </View>
      )}
    </View>
  );

  const renderConfiguration = () => (
    <View style={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackToClientSelection}>
        <Ionicons name="arrow-back" size={20} color="#A78BFA" />
        <Text style={styles.backText}>Back to clients</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Configure Assignment</Text>
      <Text style={styles.subtitle}>
        Assigning "{workoutPlanTitle}" to {selectedClient?.fullName}
      </Text>

      <ScrollView style={styles.configForm}>
        {/* Days Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Days *</Text>
          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day) => (
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
                  {day.label.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration (weeks) *</Text>
          <TextInput
            style={styles.input}
            value={weeksCount}
            onChangeText={setWeeksCount}
            placeholder="4"
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Start Date *</Text>
          <TextInput
            style={styles.input}
            value={suggestedStartDate}
            onChangeText={setSuggestedStartDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Date *</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any special instructions or notes for your client..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Assignment Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Assignment Summary</Text>
          <Text style={styles.summaryText}>
            • {selectedDays.length} workout days per week
          </Text>
          <Text style={styles.summaryText}>
            • {weeksCount} weeks duration
          </Text>
          <Text style={styles.summaryText}>
            • Total: {selectedDays.length * parseInt(weeksCount || '0')} workouts
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.assignButton, loading && styles.assignButtonDisabled]}
        onPress={handleAssign}
        disabled={loading || selectedDays.length === 0}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.assignButtonText}>Assign Workout Plan</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Assign Workout Plan</Text>
            <View style={styles.headerSpacer} />
          </View>

          {step === 'select-client' ? renderClientSelection() : renderConfiguration()}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  clientsList: {
    flex: 1,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#A78BFA',
    marginLeft: 8,
  },
  configForm: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayButtonSelected: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
  },
  summarySection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  assignButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  assignButtonDisabled: {
    backgroundColor: '#ccc',
  },
  assignButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
}); 