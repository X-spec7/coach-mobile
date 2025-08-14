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
import CreateSessionModal from '../modals/CreateSessionModal';

export default function CoachSessionsScreen() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchMySessions(true);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchMySessions(true);
    }
  }, [searchQuery]);

  const fetchMySessions = async (reset: boolean = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const newOffset = reset ? 0 : offset;
      
      const response = await SessionService.getMySessions({
        limit,
        offset: newOffset,
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
      console.error('Error fetching my sessions:', error);
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
    await fetchMySessions(true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchMySessions(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    setJoiningSessionId(sessionId);
    try {
      const response = await SessionService.joinSession(sessionId);
      Alert.alert(
        'Host Session',
        'Opening Zoom meeting as host...',
        [
          {
            text: 'OK',
            onPress: () => {
              // In a real app, you would open the Zoom URL
              console.log('Host Zoom URL:', response.zoom_url);
              // For now, just show the URL
              Alert.alert('Host Zoom URL', response.zoom_url);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error joining session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join session';
      Alert.alert('Error', errorMessage);
    } finally {
      setJoiningSessionId(null);
    }
  };

  const handleSessionPress = (session: Session) => {
    // Show session details
    Alert.alert(
      session.title,
      `${session.description}\n\nParticipants: ${session.currentParticipantNumber}/${session.totalParticipantNumber}\nPrice: $${session.price}\nDuration: ${session.duration} minutes`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join as Host', onPress: () => handleJoinSession(session.id) },
      ]
    );
  };

  const handleSessionCreated = () => {
    // Refresh sessions after creating a new one
    fetchMySessions(true);
  };

  const renderSession = ({ item }: { item: Session }) => (
    <SessionCard
      session={item}
      onPress={handleSessionPress}
      showJoinButton={true}
      onJoinPress={handleJoinSession}
      isLoading={joiningSessionId === item.id}
    />
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
        <Text style={styles.emptyStateText}>No sessions created yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Create your first fitness session to get started
        </Text>
        <TouchableOpacity
          style={styles.createFirstButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createFirstButtonText}>Create First Session</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>My Sessions</Text>
          <Text style={styles.headerSubtitle}>
            Manage your created fitness sessions
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.instantButton}
          onPress={() => Alert.alert('Instant Meeting', 'This feature is not yet implemented.')}
        >
          <Ionicons name="flash" size={20} color="#fff" />
          <Text style={styles.instantButtonText}>Instant Meeting</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your sessions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
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
            onPress={() => fetchMySessions(true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Create Session Modal */}
      <CreateSessionModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSessionCreated={handleSessionCreated}
      />
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
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A78BFA',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instantButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  instantButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
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
    marginBottom: 24,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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