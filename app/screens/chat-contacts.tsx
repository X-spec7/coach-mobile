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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { ChatService, Contact, User } from '../services/chatService';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

export default function ChatContactsScreen() {
  const { user } = useAuth();
  const { contacts, updateContacts, unreadMessagesCount, isConnected } = useChat();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchContacts = async () => {
    setRefreshing(true);
    try {
      const response = await ChatService.getContacts();
      updateContacts(response.contacts);
      setError(null);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load contacts';
      
      // Only show error alert if it's not an authentication issue
      if (!errorMessage.includes('Authentication required')) {
        setError('Unable to load contacts. Please check your connection.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await ChatService.searchUsers({
        query: query.trim(),
        limit: 20,
        offset: 0,
      });
      
      // Filter out current user from search results
      const filteredUsers = response.users.filter(u => u.id !== user?.id);
      setSearchResults(filteredUsers);
      setError(null);
    } catch (error) {
      console.error('Error searching users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      
      // Only show error alert if it's not an authentication issue
      if (!errorMessage.includes('Authentication required')) {
        setError('Unable to search users. Please check your connection.');
      }
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  };

  const handleContactPress = (contact: Contact) => {
    router.push({
      pathname: '/chat',
      params: {
        userId: contact.id,
        userName: contact.fullName,
        userAvatar: contact.avatarUrl || '',
      },
    });
  };

  const handleUserPress = (searchUser: User) => {
    router.push({
      pathname: '/chat',
      params: {
        userId: searchUser.id,
        userName: searchUser.fullName,
        userAvatar: searchUser.avatarUrl || '',
      },
    });
  };

  const formatLastMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactCard}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.contactHeader}>
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color="#A78BFA" />
          </View>
        )}
        
        <View style={styles.contactInfo}>
          <View style={styles.contactRow}>
            <Text style={styles.contactName}>{item.fullName}</Text>
            {item.lastMessage && (
              <Text style={styles.lastMessageTime}>
                {formatLastMessageTime(item.lastMessage.sentDate)}
              </Text>
            )}
          </View>
          
          <View style={styles.contactRow}>
            <Text style={styles.userType}>{item.userType}</Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
          
          {item.lastMessage && (
            <Text 
              style={[
                styles.lastMessage,
                !item.lastMessage.isRead && !item.lastMessage.isSent && styles.unreadMessage
              ]} 
              numberOfLines={1}
            >
              {item.lastMessage.isSent ? 'You: ' : ''}{item.lastMessage.content}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.searchResultCard}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.contactHeader}>
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color="#A78BFA" />
          </View>
        )}
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.fullName}</Text>
          <Text style={styles.userType}>{item.userType}</Text>
        </View>

        <Ionicons name="mail-outline" size={20} color="#A78BFA" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.headerSubtitleRow}>
            <Text style={styles.headerSubtitle}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Text>
            <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#4CAF50' : '#FFA726' }]} />
            {unreadMessagesCount > 0 && (
              <View style={styles.totalUnreadBadge}>
                <Text style={styles.totalUnreadText}>
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          style={styles.searchButton}
        >
          <Ionicons name={showSearch ? "close" : "search"} size={24} color="#A78BFA" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchTextInput}
              placeholder={`Search ${user?.userType === 'Coach' ? 'clients' : 'coaches'}...`}
              placeholderTextColor="#666"
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
      )}

      {/* Content */}
      {showSearch && searchQuery ? (
        // Search Results
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text style={styles.loadingText}>Searching users...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={64} color="#666" />
                  <Text style={styles.emptyStateText}>No users found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Try adjusting your search terms
                  </Text>
                </View>
              }
            />
          )}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      ) : (
        // Recent Conversations
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Recent Conversations</Text>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text style={styles.loadingText}>Loading conversations...</Text>
            </View>
          ) : (
            <FlatList
              data={contacts}
              renderItem={renderContact}
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
                  <Ionicons name="mail-outline" size={64} color="#666" />
                  <Text style={styles.emptyStateText}>No conversations yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Start a conversation by searching for {user?.userType === 'Coach' ? 'clients' : 'coaches'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.startChatButton}
                    onPress={() => setShowSearch(true)}
                  >
                    <Text style={styles.startChatButtonText}>Start Chatting</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
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
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  totalUnreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  totalUnreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 20,
    marginBottom: 10,
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  userType: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  unreadMessage: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  startChatButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFE5E5',
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
}); 