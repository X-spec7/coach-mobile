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
import { MealService, AssignMealPlanRequest, WeekDay } from '../services/mealService';
import { CoachClientService, Client } from '../services/coachClientService';
import { useAuth } from '../contexts/AuthContext';

interface AssignMealPlanModalProps {
  visible: boolean;
  onClose: () => void;
  mealPlanId: string;
  mealPlanName: string;
  onAssignSuccess?: () => void;
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

export const AssignMealPlanModal: React.FC<AssignMealPlanModalProps> = ({
  visible,
  onClose,
  mealPlanId,
  mealPlanName,
  onAssignSuccess,
}) => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>([]);
  const [weeksCount, setWeeksCount] = useState<string>('4');
  const [startDate, setStartDate] = useState<string>('');
  const [step, setStep] = useState<'select-client' | 'configure'>('select-client');

  useEffect(() => {
    if (visible) {
      fetchClients();
      // Set default start date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setStartDate(tomorrow.toISOString().split('T')[0]);
    } else {
      // Reset form when modal closes
      setSelectedClient(null);
      setSelectedDays([]);
      setWeeksCount('4');
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

  const toggleDay = (day: WeekDay) => {
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

    if (!startDate) {
      Alert.alert('Error', 'Please select a start date.');
      return;
    }

    setLoading(true);
    try {
      const assignmentData: AssignMealPlanRequest = {
        client_id: selectedClient.id,
        meal_plan_id: mealPlanId,
        selected_days: selectedDays,
        weeks_count: weeks,
        start_date: startDate,
      };

      console.log('[AssignMealPlan] Assignment data:', JSON.stringify(assignmentData, null, 2));
      
      await MealService.assignMealPlan(assignmentData);
      
      Alert.alert(
        'Success',
        `Meal plan "${mealPlanName}" has been assigned to ${selectedClient.fullName}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              onAssignSuccess?.();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error assigning meal plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign meal plan';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderClientSelection = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Select Client</Text>
      <Text style={styles.subtitle}>
        Choose which client to assign "{mealPlanName}" to:
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
            You need to have active client relationships to assign meal plans.
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
        Assigning "{mealPlanName}" to {selectedClient?.fullName}
      </Text>

      <ScrollView style={styles.configForm}>
        {/* Days Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Days *</Text>
          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day.key as WeekDay) && styles.dayButtonSelected,
                ]}
                onPress={() => toggleDay(day.key as WeekDay)}
              >
                <Text style={[
                  styles.dayButtonText,
                  selectedDays.includes(day.key as WeekDay) && styles.dayButtonTextSelected,
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

        {/* Start Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Date *</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
          />
          <Text style={styles.inputHint}>Format: YYYY-MM-DD (e.g., 2025-02-01)</Text>
        </View>

        {/* Assignment Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Assignment Summary</Text>
          <Text style={styles.summaryText}>
            • {selectedDays.length} meal days per week
          </Text>
          <Text style={styles.summaryText}>
            • {weeksCount} weeks duration
          </Text>
          <Text style={styles.summaryText}>
            • Total: {selectedDays.length * parseInt(weeksCount || '0')} meal sessions
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
          <Text style={styles.assignButtonText}>Assign Meal Plan</Text>
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
            <Text style={styles.headerTitle}>Assign Meal Plan</Text>
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
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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

export default AssignMealPlanModal;
