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
  TextInput,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { SessionService, Session } from '../services/sessionService';
import { useAuth } from '../contexts/AuthContext';
import SessionCard from '../components/SessionCard';

const GOAL_FILTERS = [
  'All',
  'Cardio',
  'Strength',
  'Yoga',
  'Flexibility',
  'Weight Loss',
  'HIIT',
  'Pilates',
  'CrossFit',
  'Boxing',
  'Dance',
];

export default function SessionsScreen() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('All');
  const [sessionView, setSessionView] = useState<'all' | 'booked' | 'notBooked'>('all');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);
  const [bookedSessionIds, setBookedSessionIds] = useState<Set<string>>(new Set());
  
  // Join confirmation modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const limit = 10;

  useEffect(() => {
    // Only fetch booked sessions on initial load
    // fetchSessions will be called by the other useEffect when sessionView changes
    fetchBookedSessions();
  }, []);

  // Refresh booked sessions when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchBookedSessions();
    }, [])
  );

  useEffect(() => {
    // Always fetch sessions when any filter condition changes
    fetchSessions(true);
  }, [searchQuery, selectedGoal, sessionView]);

  const fetchSessions = async (reset: boolean = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const newOffset = reset ? 0 : offset;
      
      // For "All" view, we fetch all sessions without the booked filter
      // For "Booked" view, we fetch only booked sessions
      // For "Available" view, we fetch only non-booked sessions
      const response = await SessionService.getAllSessions({
        limit,
        offset: newOffset,
        goal: selectedGoal !== 'All' ? selectedGoal : undefined,
        booked: sessionView === 'booked' ? true : sessionView === 'notBooked' ? false : undefined,
        query: searchQuery.trim() || undefined,
      });

      const newSessions = response.sessions;
      setHasMore(newSessions.length === limit);
      
      if (reset) {
        setSessions(newSessions);
        setOffset(newSessions.length);
      } else {
        setSessions(prev => [...prev, ...newSessions]);
        setOffset(prev => prev + newSessions.length);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load sessions';
      setError(errorMessage);
      if (reset) {
        setSessions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setOffset(0);
    setHasMore(true);
    await Promise.all([
      fetchSessions(true),
      fetchBookedSessions()
    ]);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchSessions(false);
    }
  };

  const fetchBookedSessions = async () => {
    try {
      const response = await SessionService.getAllSessions({
        limit: 100, // Get a reasonable number of booked sessions
        offset: 0,
        booked: true,
      });
      
      const bookedIds = new Set(response.sessions.map(session => session.id));
      setBookedSessionIds(bookedIds);
    } catch (error) {
      console.error('Error fetching booked sessions:', error);
      // Don't show error to user, just log it
    }
  };

  const handleBookSession = async (sessionId: string) => {
    setBookingSessionId(sessionId);
    try {
      await SessionService.bookSession(sessionId);
      Alert.alert('Success', 'Session booked successfully!');
      // Refresh the sessions to update booking status
      fetchSessions(true);
      // Update booked sessions list
      setBookedSessionIds(prev => new Set([...prev, sessionId]));
    } catch (error) {
      console.error('Error booking session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to book session';
      Alert.alert('Error', errorMessage);
    } finally {
      setBookingSessionId(null);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      const response = await SessionService.joinSession(sessionId);
      
      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(response.zoom_url);
      
      if (canOpen) {
        // Open the Zoom URL in the browser
        await Linking.openURL(response.zoom_url);
      } else {
        // Fallback: show the URL to the user
        Alert.alert(
          'Join Session',
          'Unable to open Zoom automatically. Please copy and paste this URL into your browser:',
          [
            { text: 'Copy URL', onPress: () => {
              // You could add clipboard functionality here if needed
              console.log('Zoom URL:', response.zoom_url);
            }},
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('Error joining session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join session';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleSessionPress = (session: Session) => {
    // Use the same logic as renderSession to determine if session is booked
    let isBooked = false;
    
    if (sessionView === 'booked') {
      isBooked = true; // All sessions in booked view are booked
    } else if (sessionView === 'notBooked') {
      isBooked = false; // All sessions in available view are not booked
    } else {
      // In "All" view, check against our booked sessions list
      isBooked = bookedSessionIds.has(session.id);
    }
    
    if (isBooked) {
      // Show join confirmation modal for booked sessions
      setSelectedSession(session);
      setShowJoinModal(true);
    } else {
      // Show book session modal for unbooked sessions
      Alert.alert(
        session.title,
        `${session.description}\n\nCoach: ${session.coachFullname}\nPrice: $${session.price}\nDuration: ${session.duration} minutes`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Book Session', onPress: () => handleBookSession(session.id) },
        ]
      );
    }
  };

  const confirmJoinSession = () => {
    if (selectedSession) {
      setShowJoinModal(false);
      handleJoinSession(selectedSession.id);
      setSelectedSession(null);
    }
  };

  const cancelJoinSession = () => {
    setShowJoinModal(false);
    setSelectedSession(null);
  };

  const renderSession = ({ item }: { item: Session }) => {
    // In "All" view, we need to check if this session is booked
    // In "Booked" view, all sessions are booked
    // In "Available" view, all sessions are not booked
    let isBooked = false;
    
    if (sessionView === 'booked') {
      isBooked = true; // All sessions in booked view are booked
    } else if (sessionView === 'notBooked') {
      isBooked = false; // All sessions in available view are not booked
    } else {
      // In "All" view, check against our booked sessions list
      isBooked = bookedSessionIds.has(item.id);
    }
    
    return (
      <SessionCard
        session={item}
        onPress={handleSessionPress}
        showBookButton={!isBooked}
        showJoinButton={isBooked}
        onBookPress={handleBookSession}
        onJoinPress={handleJoinSession}
        isBooked={isBooked}
        isLoading={bookingSessionId === item.id}
      />
    );
  };

  const renderGoalFilter = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedGoal === item && styles.filterChipSelected,
      ]}
      onPress={() => setSelectedGoal(item)}
    >
      <Text
        style={[
          styles.filterChipText,
          selectedGoal === item && styles.filterChipTextSelected,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#A78BFA" />
        <Text style={styles.loadingText}>Loading more sessions...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.emptyStateText}>Loading sessions...</Text>
        </View>
      );
    }

    let emptyText = 'No sessions available';
    let emptySubtext = 'Check back later for new fitness sessions';

    if (sessionView === 'booked') {
      emptyText = 'No booked sessions';
      emptySubtext = 'Book some sessions to see them here';
    } else if (sessionView === 'notBooked') {
      emptyText = 'No available sessions';
      emptySubtext = 'All sessions are currently booked';
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="videocam-outline" size={64} color="#666" />
        <Text style={styles.emptyStateText}>{emptyText}</Text>
        <Text style={styles.emptyStateSubtext}>{emptySubtext}</Text>
      </View>
    );
  };

  const getHeaderTitle = () => {
    switch (sessionView) {
      case 'booked':
        return 'My Sessions';
      case 'notBooked':
        return 'Available Sessions';
      default:
        return 'Live Sessions';
    }
  };

  const getHeaderSubtitle = () => {
    switch (sessionView) {
      case 'booked':
        return 'Your booked fitness sessions';
      case 'notBooked':
        return 'Available sessions to book';
      default:
        return 'Join live fitness sessions with coaches';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <Text style={styles.headerSubtitle}>{getHeaderSubtitle()}</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sessions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              sessionView === 'all' && styles.toggleButtonActive,
            ]}
            onPress={() => setSessionView('all')}
          >
            <Ionicons 
              name="list-outline" 
              size={16} 
              color={sessionView === 'all' ? "#fff" : "#666"} 
            />
            <Text
              style={[
                styles.toggleButtonText,
                sessionView === 'all' && styles.toggleButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              sessionView === 'booked' && styles.toggleButtonActive,
            ]}
            onPress={() => setSessionView('booked')}
          >
            <Ionicons 
              name="checkmark-circle" 
              size={16} 
              color={sessionView === 'booked' ? "#fff" : "#666"} 
            />
            <Text
              style={[
                styles.toggleButtonText,
                sessionView === 'booked' && styles.toggleButtonTextActive,
              ]}
            >
              Booked
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              sessionView === 'notBooked' && styles.toggleButtonActive,
            ]}
            onPress={() => setSessionView('notBooked')}
          >
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={sessionView === 'notBooked' ? "#fff" : "#666"} 
            />
            <Text
              style={[
                styles.toggleButtonText,
                sessionView === 'notBooked' && styles.toggleButtonTextActive,
              ]}
            >
              Available
            </Text>
          </TouchableOpacity>
        </View>

        {sessionView === 'all' && (
          <FlatList
            data={GOAL_FILTERS}
            renderItem={renderGoalFilter}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.goalFilters}
          />
        )}
      </View>

      {/* Sessions List */}
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.sessionsList}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#A78BFA']}
            tintColor="#A78BFA"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchSessions(true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Join Confirmation Modal */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={cancelJoinSession}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="videocam" size={48} color="#A78BFA" />
              <Text style={styles.modalTitle}>Join Session</Text>
            </View>
            
            {selectedSession && (
              <View style={styles.modalContent}>
                <Text style={styles.sessionTitle}>{selectedSession.title}</Text>
                <Text style={styles.sessionDescription}>{selectedSession.description}</Text>
                
                <View style={styles.sessionDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={16} color="#666" />
                    <Text style={styles.detailText}>Coach: {selectedSession.coachFullname}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.detailText}>Duration: {selectedSession.duration} minutes</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text style={styles.detailText}>Date: {new Date(selectedSession.startDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>Time: {new Date(selectedSession.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>
                
                <Text style={styles.confirmationText}>
                  Are you ready to join this session? The Zoom meeting will open in your browser.
                </Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelJoinSession}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.joinButton]}
                onPress={confirmJoinSession}
              >
                <Text style={styles.joinButtonText}>Join Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#A78BFA',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  goalFilters: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#A78BFA',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  sessionsList: {
    padding: 20,
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
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
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFE5E5',
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 12,
  },
  modalContent: {
    marginBottom: 24,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  sessionDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  confirmationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#A78BFA',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 