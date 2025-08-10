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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
  const [showBookedOnly, setShowBookedOnly] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);

  const limit = 10;

  useEffect(() => {
    fetchSessions(true);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() || selectedGoal !== 'All' || showBookedOnly) {
      fetchSessions(true);
    }
  }, [searchQuery, selectedGoal, showBookedOnly]);

  const fetchSessions = async (reset: boolean = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const newOffset = reset ? 0 : offset;
      
      const response = await SessionService.getAllSessions({
        limit,
        offset: newOffset,
        goal: selectedGoal !== 'All' ? selectedGoal : undefined,
        booked: showBookedOnly ? true : undefined,
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
    await fetchSessions(true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchSessions(false);
    }
  };

  const handleBookSession = async (sessionId: string) => {
    setBookingSessionId(sessionId);
    try {
      await SessionService.bookSession(sessionId);
      Alert.alert('Success', 'Session booked successfully!');
      // Refresh the sessions to update booking status
      fetchSessions(true);
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
      Alert.alert(
        'Join Session',
        'Opening Zoom meeting...',
        [
          {
            text: 'OK',
            onPress: () => {
              // In a real app, you would open the Zoom URL
              console.log('Zoom URL:', response.zoom_url);
              // For now, just show the URL
              Alert.alert('Zoom URL', response.zoom_url);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error joining session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join session';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleSessionPress = (session: Session) => {
    // Navigate to session details or show session info
    Alert.alert(
      session.title,
      `${session.description}\n\nCoach: ${session.coachFullname}\nPrice: $${session.price}\nDuration: ${session.duration} minutes`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Session', onPress: () => handleBookSession(session.id) },
      ]
    );
  };

  const renderSession = ({ item }: { item: Session }) => (
    <SessionCard
      session={item}
      onPress={handleSessionPress}
      showBookButton={true}
      showJoinButton={showBookedOnly}
      onBookPress={handleBookSession}
      onJoinPress={handleJoinSession}
      isLoading={bookingSessionId === item.id}
    />
  );

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

    return (
      <View style={styles.emptyState}>
        <Ionicons name="videocam-outline" size={64} color="#666" />
        <Text style={styles.emptyStateText}>
          {showBookedOnly ? 'No booked sessions' : 'No sessions available'}
        </Text>
        <Text style={styles.emptyStateSubtext}>
          {showBookedOnly 
            ? 'Book some sessions to see them here'
            : 'Check back later for new fitness sessions'
          }
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {showBookedOnly ? 'My Sessions' : 'Live Sessions'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {showBookedOnly 
              ? 'Your booked fitness sessions'
              : 'Join live fitness sessions with coaches'
            }
          </Text>
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
              showBookedOnly && styles.toggleButtonActive,
            ]}
            onPress={() => setShowBookedOnly(!showBookedOnly)}
          >
            <Ionicons 
              name={showBookedOnly ? "checkmark-circle" : "calendar-outline"} 
              size={16} 
              color={showBookedOnly ? "#fff" : "#666"} 
            />
            <Text
              style={[
                styles.toggleButtonText,
                showBookedOnly && styles.toggleButtonTextActive,
              ]}
            >
              {showBookedOnly ? 'Booked' : 'All Sessions'}
            </Text>
          </TouchableOpacity>
        </View>

        {!showBookedOnly && (
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
    marginBottom: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
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
}); 