import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { CoachClientService, WorkoutAssignment } from '../services/coachClientService';
import { useAuth } from '../contexts/AuthContext';

export default function WorkoutAssignmentsScreen() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'applied' | 'completed'>('all');

  const isCoach = user?.userType === 'Coach';

  useEffect(() => {
    fetchAssignments();
  }, [filter]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = {
        role: user?.userType === 'Coach' ? 'coach' : 'client',
        status: filter === 'all' ? undefined : filter,
      };

      const response = await CoachClientService.getWorkoutAssignments(params);
      setAssignments(response.assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load assignments';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('User not authenticated, skipping fetch');
        setAssignments([]);
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        Alert.alert(
          'Feature Not Available', 
          'The workout assignment feature is not yet available on this server.'
        );
        setAssignments([]);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAssignments();
    setRefreshing(false);
  };

  const handleAcceptAssignment = async (assignment: WorkoutAssignment) => {
    Alert.alert(
      'Accept Assignment',
      `Accept the workout plan "${assignment.workout_plan_title}" from ${assignment.coach_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await CoachClientService.acceptWorkoutAssignment({
                assignment_id: assignment.id,
                // Use coach's suggestions by default
              });
              
              Alert.alert('Success', 'Workout plan accepted and applied to your schedule!');
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

  const handleRejectAssignment = async (assignment: WorkoutAssignment) => {
    Alert.alert(
      'Reject Assignment',
      `Reject the workout plan "${assignment.workout_plan_title}" from ${assignment.coach_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await CoachClientService.rejectWorkoutAssignment(assignment.id);
              
              Alert.alert('Success', 'Workout plan assignment rejected.');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return '#FFA726';
      case 'applied': return '#4CAF50';
      case 'completed': return '#9C27B0';
      case 'overdue': return '#FF6B6B';
      case 'cancelled': return '#666';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return 'mail-outline';
      case 'applied': return 'checkmark-circle';
      case 'completed': return 'trophy';
      case 'overdue': return 'alert-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDays = (days: string[]) => {
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
  };

  const renderAssignment = ({ item }: { item: WorkoutAssignment }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <View style={styles.assignmentInfo}>
          <Text style={styles.workoutPlanTitle}>{item.workout_plan_title}</Text>
          <Text style={styles.participantName}>
            {isCoach ? `To: ${item.client_name}` : `From: ${item.coach_name}`}
          </Text>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Ionicons 
                name={getStatusIcon(item.status)} 
                size={14} 
                color="#fff" 
              />
              <Text style={styles.statusText}>{item.status_display}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.assignmentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#A78BFA" />
          <Text style={styles.detailText}>
            {formatDays(item.selected_days)} • {item.weeks_count} weeks
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#A78BFA" />
          <Text style={styles.detailText}>
            Start: {formatDate(item.suggested_start_date)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="alarm" size={16} color="#A78BFA" />
          <Text style={styles.detailText}>
            Due: {formatDate(item.due_date)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="create" size={16} color="#A78BFA" />
          <Text style={styles.detailText}>
            Assigned: {formatDate(item.assigned_at)}
          </Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>"{item.notes}"</Text>
        </View>
      )}

      {/* Action Buttons for Clients */}
      {!isCoach && item.status === 'assigned' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptAssignment(item)}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleRejectAssignment(item)}
          >
            <Ionicons name="close" size={16} color="#fff" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Status Info for Applied/Completed */}
      {item.status === 'applied' && (
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={16} color="#4CAF50" />
          <Text style={styles.infoText}>
            This workout plan has been applied to your schedule
          </Text>
        </View>
      )}

      {item.status === 'completed' && (
        <View style={styles.infoContainer}>
          <Ionicons name="trophy" size={16} color="#9C27B0" />
          <Text style={styles.infoText}>
            Congratulations! You completed this workout plan
          </Text>
        </View>
      )}
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {(['all', 'assigned', 'applied', 'completed'] as const).map((filterType) => (
        <TouchableOpacity
          key={filterType}
          style={[
            styles.filterTab,
            filter === filterType && styles.filterTabActive,
          ]}
          onPress={() => setFilter(filterType)}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === filterType && styles.filterTabTextActive,
            ]}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {user?.userType === 'Coach' ? 'Client Assignments' : 'My Assignments'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {user?.userType === 'Coach' 
              ? 'Workout plans assigned to clients'
              : 'Workout plans assigned by coaches'
            }
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Assignments List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Loading assignments...</Text>
        </View>
      ) : (
        <FlatList
          data={assignments}
          renderItem={renderAssignment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#A78BFA']}
              tintColor="#A78BFA"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color="#666" />
              <Text style={styles.emptyStateText}>
                {filter === 'assigned' 
                  ? 'No pending assignments'
                  : filter === 'applied'
                  ? 'No applied assignments'
                  : filter === 'completed'
                  ? 'No completed assignments'
                  : 'No assignments yet'
                }
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {isCoach 
                  ? 'Assign workout plans to your connected clients'
                  : 'Your coach will assign workout plans for you'
                }
              </Text>
            </View>
          }
        />
      )}
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
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterTabActive: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
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
    marginBottom: 12,
  },
  assignmentInfo: {
    flex: 1,
  },
  workoutPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
    marginBottom: 8,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  assignmentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f0ff',
  },
  infoText: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 50,
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
}); 