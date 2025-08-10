import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserService, User } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

interface UserSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onUserSelect: (user: User) => void;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  visible,
  onClose,
  onUserSelect,
}) => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setUsers([]);
      setOffset(0);
      setHasMore(true);
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && searchQuery.trim()) {
      const delayDebounceFn = setTimeout(() => {
        searchUsers(searchQuery.trim(), true);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else if (visible && !searchQuery.trim()) {
      setUsers([]);
      setOffset(0);
      setHasMore(true);
    }
  }, [searchQuery, visible]);

  const searchUsers = async (query: string, reset: boolean = false) => {
    if (!query.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const newOffset = reset ? 0 : offset;
      
      let response;
      if (currentUser?.userType === 'Coach') {
        // Coach searching for clients
        response = await UserService.getClients({
          query,
          limit,
          offset: newOffset,
        });
        const newUsers = response.clients;
        setHasMore(newUsers.length === limit);
        setUsers(reset ? newUsers : [...users, ...newUsers]);
        setOffset(newOffset + newUsers.length);
      } else {
        // Client searching for coaches
        response = await UserService.getCoaches({
          query,
          limit,
          offset: newOffset,
        });
        const newUsers = response.coaches;
        setHasMore(newUsers.length === limit);
        setUsers(reset ? newUsers : [...users, ...newUsers]);
        setOffset(newOffset + newUsers.length);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      if (reset) {
        setUsers([]);
      }
    } finally {
      setSearching(false);
    }
  };

  const loadMore = () => {
    if (!searching && hasMore && searchQuery.trim()) {
      searchUsers(searchQuery.trim(), false);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    onUserSelect(selectedUser);
    onClose();
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserSelect(item)}
    >
      <View style={styles.userHeader}>
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
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name}</Text>
          <Text style={styles.userType}>{item.user_type}</Text>
          {item.coach_profile?.specialization && (
            <Text style={styles.specialization}>
              {item.coach_profile.specialization}
            </Text>
          )}
        </View>

        <Ionicons name="mail-outline" size={20} color="#A78BFA" />
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!searching || !hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#A78BFA" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (searching) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.emptyStateText}>Searching...</Text>
        </View>
      );
    }

    if (searchQuery.trim() && !searching) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#666" />
          <Text style={styles.emptyStateText}>No users found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try adjusting your search terms
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="search-outline" size={64} color="#666" />
        <Text style={styles.emptyStateText}>
          Search for {currentUser?.userType === 'Coach' ? 'clients' : 'coaches'}
        </Text>
        <Text style={styles.emptyStateSubtext}>
          Enter a name to start searching
        </Text>
      </View>
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
              Search {currentUser?.userType === 'Coach' ? 'Clients' : 'Coaches'}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchTextInput}
                placeholder={`Search ${currentUser?.userType === 'Coach' ? 'clients' : 'coaches'}...`}
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Users List */}
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
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
  searchContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFE5E5',
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
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
  userHeader: {
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userType: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
    marginBottom: 2,
  },
  specialization: {
    fontSize: 12,
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
});

export default UserSearchModal; 