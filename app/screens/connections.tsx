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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { CoachClientService, CoachClientRelationship } from '../services/coachClientService';
import { useAuth } from '../contexts/AuthContext';
import { ErrorModal } from '../components/ErrorModal';
import { handleApiError, ErrorInfo } from '../utils/errorHandler';

export default function ConnectionsScreen() {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<CoachClientRelationship[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  
  // Error handling state
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    fetchRelationships();
  }, [filter]);

  const fetchRelationships = async () => {
    setLoading(true);
    try {
      const params = {
        status: filter === 'all' ? undefined : filter,
      };

      const response = await CoachClientService.getMyRelationships(params);
      setRelationships(response.relationships);
    } catch (error) {
      console.error('Error fetching relationships:', error);
      const errorInfo = handleApiError(error, 'fetch_relationships');
      setErrorInfo(errorInfo);
      setShowErrorModal(true);
      setRelationships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRelationships();
    setRefreshing(false);
  };

  const handleUpdateRelationship = async (
    relationshipId: string, // Changed from number to string for UUID support
    status: 'active' | 'inactive' | 'terminated',
    relationshipType: string
  ) => {
    const actionText = status === 'active' ? 'accept' : status === 'terminated' ? 'terminate' : 'deactivate';
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Connection`,
      `Are you sure you want to ${actionText} this ${relationshipType} relationship?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: status === 'terminated' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await CoachClientService.updateRelationship(relationshipId, {
                status,
                notes: status === 'active' 
                  ? 'Connection accepted' 
                  : status === 'terminated' 
                    ? 'Connection terminated' 
                    : 'Connection deactivated',
              });
              
              Alert.alert('Success', `Connection ${actionText}ed successfully!`);
              fetchRelationships();
            } catch (error) {
              console.error('Error updating relationship:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to update connection';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'active': return '#4CAF50';
      case 'inactive': return '#666';
      case 'terminated': return '#FF6B6B';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'active': return 'checkmark-circle';
      case 'inactive': return 'pause-circle';
      case 'terminated': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderRelationship = ({ item }: { item: CoachClientRelationship }) => {
    const isCoach = user?.userType === 'Coach';
    const otherUser = isCoach ? item.client : item.coach;
    const relationshipType = isCoach ? 'client' : 'coach';

    return (
      <View style={styles.relationshipCard}>
        <View style={styles.relationshipHeader}>
          <View style={styles.userAvatarPlaceholder}>
            <Ionicons name="person" size={24} color="#A78BFA" />
          </View>
          
          <View style={styles.relationshipInfo}>
            <Text style={styles.userName}>{otherUser.fullName}</Text>
            <Text style={styles.userEmail}>{otherUser.email}</Text>
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Ionicons 
                  name={getStatusIcon(item.status)} 
                  size={14} 
                  color="#fff" 
                />
                <Text style={styles.statusText}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {item.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>"{item.notes}"</Text>
          </View>
        )}

        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            Started: {new Date(item.startDate).toLocaleDateString()}
          </Text>
          {item.endDate && (
            <Text style={styles.dateText}>
              Ended: {new Date(item.endDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleUpdateRelationship(item.id, 'active', relationshipType)}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleUpdateRelationship(item.id, 'terminated', relationshipType)}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.rejectButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'active' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.terminateButton}
              onPress={() => handleUpdateRelationship(item.id, 'terminated', relationshipType)}
            >
              <Ionicons name="close-circle" size={16} color="#fff" />
              <Text style={styles.terminateButtonText}>End Connection</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {(['all', 'pending', 'active'] as const).map((filterType) => (
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
            {user?.userType === 'Coach' ? 'My Clients' : 'My Coaches'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Manage your {user?.userType === 'Coach' ? 'client' : 'coach'} relationships
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/find-coaches')} 
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#A78BFA" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Connections List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Loading connections...</Text>
        </View>
      ) : (
        <FlatList
          data={relationships}
          renderItem={renderRelationship}
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
              <Ionicons name="people-outline" size={64} color="#666" />
              <Text style={styles.emptyStateText}>
                {filter === 'pending' 
                  ? 'No pending requests'
                  : filter === 'active'
                  ? 'No active connections'
                  : 'No connections yet'
                }
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {user?.userType === 'Coach' 
                  ? 'Start by finding clients to connect with'
                  : 'Find coaches to build your fitness journey'
                }
              </Text>
              <TouchableOpacity 
                style={styles.findButton}
                onPress={() => router.push('/find-coaches')}
              >
                <Text style={styles.findButtonText}>
                  Find {user?.userType === 'Coach' ? 'Clients' : 'Coaches'}
                </Text>
              </TouchableOpacity>
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
  addButton: {
    padding: 8,
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
    paddingHorizontal: 16,
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
    fontSize: 14,
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
  relationshipCard: {
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
  relationshipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relationshipInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
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
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontStyle: 'italic',
  },
  dateContainer: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
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
  terminateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  terminateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 24,
  },
  findButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 