import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { WorkoutService, WorkoutPlanAssignment } from '../services/workoutService';

export default function WorkoutAssignmentsScreen() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<WorkoutPlanAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'assigned' | 'applied' | 'completed'>('assigned');

  useEffect(() => {
    fetchAssignments();
  }, [activeTab]);

  const fetchAssignments = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await WorkoutService.getWorkoutPlanAssignments({
        role: 'auto', // Let backend detect user role
        status: activeTab,
      });
      setAssignments(response.assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load assignments';
      
      // Don't show alert for authentication errors
      if (!errorMessage.includes('Authentication required')) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAssignments(true);
  };

  const handleAcceptAssignment = async (assignment: WorkoutPlanAssignment) => {
    Alert.alert(
      'Accept Assignment',
      `Accept the workout plan "${assignment.workoutPlan.title}" from ${assignment.coach.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await WorkoutService.acceptWorkoutPlanAssignment({
                assignment_id: assignment.id,
                start_date: assignment.suggestedStartDate,
                selected_days: assignment.selectedDays,
                weeks_count: assignment.weeksCount,
              });
              
              Alert.alert('Success', 'Assignment accepted! The workout plan has been added to your schedule.');
              fetchAssignments();
            } catch (error) {
              console.error('Error accepting assignment:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to accept assignment';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleRejectAssignment = async (assignment: WorkoutPlanAssignment) => {
    Alert.alert(
      'Reject Assignment',
      `Are you sure you want to reject the workout plan "${assignment.workoutPlan.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await WorkoutService.rejectWorkoutPlanAssignment(assignment.id);
              Alert.alert('Success', 'Assignment rejected.');
              fetchAssignments();
            } catch (error) {
              console.error('Error rejecting assignment:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to reject assignment';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return '#FFA726';
      case 'applied': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'overdue': return '#FF5722';
      case 'cancelled': return '#9E9E9E';
      default: return '#666';
    }
  };

  const renderAssignment = (assignment: WorkoutPlanAssignment) => {
    const isCoach = user?.userType === 'Coach';
    const otherPerson = isCoach ? assignment.client : assignment.coach;
    
    return (
      <TouchableOpacity
        key={assignment.id}
        style={styles.assignmentCard}
        onPress={() => {
          // Navigate to workout plan details or assignment details
          console.log('Assignment pressed:', assignment.id);
        }}
      >
        <View style={styles.assignmentHeader}>
          <View style={styles.assignmentInfo}>
            <Text style={styles.planTitle}>{assignment.workoutPlan.title}</Text>
            <Text style={styles.personName}>
              {isCoach ? `To: ${otherPerson.fullName}` : `From: ${otherPerson.fullName}`}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) }]}>
            <Text style={styles.statusText}>{assignment.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.assignmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {assignment.selectedDays.length} days/week for {assignment.weeksCount} weeks
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Start: {formatDate(assignment.suggestedStartDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="flag-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Due: {formatDate(assignment.dueDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="flame-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {assignment.workoutPlan.totalCalories} cal per session
            </Text>
          </View>
        </View>

        {assignment.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notesText}>{assignment.notes}</Text>
          </View>
        )}

        {/* Action buttons for clients with assigned status */}
        {!isCoach && assignment.status === 'assigned' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectAssignment(assignment)}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptAssignment(assignment)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="clipboard-outline" size={48} color="#ccc" />
      <Text style={styles.emptyStateTitle}>
        No {activeTab} assignments
      </Text>
      <Text style={styles.emptyStateText}>
        {user?.userType === 'Coach' 
          ? `You haven't ${activeTab} any workout plans to clients yet.`
          : `You don't have any ${activeTab} assignments from coaches.`
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Assignments</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
          onPress={() => setActiveTab('assigned')}
        >
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
            {user?.userType === 'Coach' ? 'Assigned' : 'Pending'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applied' && styles.activeTab]}
          onPress={() => setActiveTab('applied')}
        >
          <Text style={[styles.tabText, activeTab === 'applied' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#A78BFA"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A78BFA" />
            <Text style={styles.loadingText}>Loading assignments...</Text>
          </View>
        ) : assignments.length > 0 ? (
          <View style={styles.assignmentsList}>
            {assignments.map(renderAssignment)}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#A78BFA',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  assignmentsList: {
    padding: 20,
  },
  assignmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assignmentInfo: {
    flex: 1,
    marginRight: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  personName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  assignmentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  notesSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  acceptButton: {
    backgroundColor: '#A78BFA',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 