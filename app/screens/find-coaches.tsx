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
import { CoachClientService, Coach, Client } from '../services/coachClientService';
import { getAuthHeaders } from '../services/api';
import { API_BASE_URL } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';

export default function FindCoachesScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState<Coach[] | Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Role-based configuration
  const isCoach = user?.userType === 'Coach';
  const targetUserType = isCoach ? 'Client' : 'Coach';
  const pageTitle = isCoach ? 'Find Clients' : 'Find Coaches';
  const searchPlaceholder = isCoach ? 'Search clients by name...' : 'Search coaches by name...';
  const emptyStateText = isCoach ? 'No clients found' : 'No coaches found';
  const connectButtonText = 'Connect';

  const specializations = [
    'All',
    'Weight Loss',
    'Muscle Building',
    'Cardio',
    'Yoga',
    'Pilates',
    'CrossFit',
    'Nutrition',
  ];

  const testBackendEndpoints = async () => {
    console.log('Testing backend endpoints...');
    const headers = await getAuthHeaders();
    
    try {
      // Test: General users endpoint with role filter
      console.log(`Testing /api/users/ with ${targetUserType} filter...`);
      const usersResponse = await fetch(`${API_BASE_URL}/api/users/?user_type=${targetUserType}`, {
        method: 'GET',
        headers,
      });
      console.log(`${targetUserType} endpoint status:`, usersResponse.status);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log(`${targetUserType} data structure:`, usersData);
      }
      
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  useEffect(() => {
    fetchUsers(true);
    // Uncomment this line to test backend endpoints
    // testBackendEndpoints();
  }, [searchQuery, selectedSpecialization]);

  const fetchUsers = async (reset = false) => {
    if (loading || !user?.userType) return;
    
    const currentOffset = reset ? 0 : offset;
    setLoading(true);
    
    try {
      const params = {
        query: searchQuery || undefined,
        specialization: selectedSpecialization === 'All' ? undefined : selectedSpecialization,
        listed: 'listed',
        offset: currentOffset,
        limit: 20,
      };

      const response = await CoachClientService.findUsersForRole(user.userType, params);
      
      const responseUsers = 'coaches' in response ? response.coaches : response.users as Client[];
      const responseCount = 'totalCoachesCount' in response ? response.totalCoachesCount : response.totalUsersCount;
      
      if (reset) {
        setUsers(responseUsers as Coach[] | Client[]);
        setOffset(20);
      } else {
        setUsers(prev => [...prev, ...responseUsers] as Coach[] | Client[]);
        setOffset(currentOffset + 20);
      }
      
      setTotalCount(responseCount);
      setHasMore(responseUsers.length === 20);
      
    } catch (error) {
      console.error(`Error fetching ${targetUserType}s:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to load ${targetUserType}s`;
      
      if (errorMessage.includes('Authentication required')) {
        console.log('User not authenticated, skipping fetch');
        setUsers([]);
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        Alert.alert(
          'Feature Not Available', 
          `The ${targetUserType.toLowerCase()}-discovery feature is not yet available on this server. Please check back later or contact support.`
        );
        setUsers([]);
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        Alert.alert(
          'Server Error', 
          'The server is experiencing issues. Please try again later.'
        );
        setUsers([]);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(true);
    setRefreshing(false);
  };

  const handleRequestConnection = async (targetUser: Coach | Client) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to connect with users');
      return;
    }

    const connectionData = isCoach ? {
      coach_id: user.id,
      client_id: targetUser.id,
      status: 'pending',
      notes: `Hi ${targetUser.firstName}! I would like to work with you as your coach.`,
    } : {
      coach_id: targetUser.id,
      client_id: user.id,
      status: 'pending',
      notes: `Hi ${targetUser.firstName}! I would like to work with you as my coach.`,
    };

    Alert.alert(
      `${connectButtonText}`,
      `Send a connection request to ${targetUser.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              await CoachClientService.createRelationship(connectionData);
              Alert.alert('Success', 'Connection request sent successfully!');
            } catch (error) {
              console.error('Error sending connection request:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to send request';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color="#FFA726"
        />
      );
    }
    return stars;
  };

  const renderUser = ({ item }: { item: Coach | Client }) => {
    // Type guard to check if item is Coach
    const isCoachItem = 'coach_profile' in item;
    
    // Determine connection status and button properties
    const getConnectionStatus = () => {
      // TODO: Replace this with actual connection status from your backend
      // You can get this from:
      // 1. The user data itself (if backend includes connectionStatus field)
      // 2. A separate API call to check relationship status
      // 3. Store in local state after connection requests
      
      // Example backend integration:
      // const connectionStatus = item.connectionStatus || 'none';
      
      // For demo purposes, you can uncomment one of these lines to test different states:
      // if (item.id === 1) return { text: 'Connected', backgroundColor: '#4CAF50', disabled: true, icon: 'checkmark-circle' as const };
      // if (item.id === 2) return { text: 'Connect Requested', backgroundColor: '#FFA726', disabled: true, icon: 'time' as const };
      
      if (item.connectionStatus === 'connected') {
        return {
          text: 'Connected',
          backgroundColor: '#4CAF50',
          disabled: true,
          icon: 'checkmark-circle' as const
        };
      } else if (item.connectionStatus === 'pending') {
        return {
          text: 'Connect Requested',
          backgroundColor: '#FFA726',
          disabled: true,
          icon: 'time' as const
        };
      } else {
        return {
          text: 'Connect',
          backgroundColor: '#A78BFA',
          disabled: false,
          icon: 'person-add' as const
        };
      }
    };

    const connectionStatus = getConnectionStatus();
    
    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          {item.profilePicture ? (
            <Image
              source={{ uri: item.profilePicture }}
              style={styles.userAvatar}
            />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <Ionicons name="person" size={32} color="#A78BFA" />
            </View>
          )}
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.fullName}</Text>
            {isCoachItem && (
              <>
                <Text style={styles.userSpecialization}>
                  {(item as Coach).coach_profile.specialization}
                </Text>
                <Text style={styles.userExperience}>
                  {(item as Coach).coach_profile.yearsOfExperience} years experience
                </Text>
                
                {(item as Coach).reviews.length > 0 && (
                  <View style={styles.ratingContainer}>
                    <View style={styles.stars}>
                      {renderStars((item as Coach).reviews[0].rating)}
                    </View>
                    <Text style={styles.reviewCount}>
                      ({(item as Coach).reviews.length} reviews)
                    </Text>
                  </View>
                )}
              </>
            )}
            {!isCoachItem && (
              <Text style={styles.userType}>Client</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.connectButton,
              { backgroundColor: connectionStatus.backgroundColor },
              connectionStatus.disabled && styles.disabledButton
            ]}
            onPress={() => connectionStatus.disabled ? null : handleRequestConnection(item)}
            disabled={connectionStatus.disabled}
          >
            <Ionicons name={connectionStatus.icon} size={16} color="#fff" />
            <Text style={styles.connectButtonText}>{connectionStatus.text}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => router.push({
              pathname: '/chat',
              params: {
                userId: item.id,
                userName: item.fullName,
                userAvatar: item.profilePicture || '',
              },
            })}
          >
            <Ionicons name="mail-outline" size={16} color="#4CAF50" />
            <Text style={styles.chatButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Certification Badge */}
        {isCoachItem && (item as Coach).coach_profile.certification && (
          <View style={styles.certificationContainer}>
            <Ionicons name="ribbon" size={16} color="#4CAF50" />
            <Text style={styles.certificationText}>
              {(item as Coach).coach_profile.certification}
            </Text>
          </View>
        )}

        {/* Review */}
        {isCoachItem && (item as Coach).reviews.length > 0 && (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewText} numberOfLines={2}>
              "{(item as Coach).reviews[0].content}"
            </Text>
            <Text style={styles.reviewerName}>
              - {(item as Coach).reviews[0].reviewerName}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSpecializationFilter = () => (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={specializations}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedSpecialization === item && styles.filterChipActive,
            ]}
            onPress={() => setSelectedSpecialization(item)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedSpecialization === item && styles.filterChipTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
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
          <Text style={styles.headerTitle}>{pageTitle}</Text>
          <Text style={styles.headerSubtitle}>
            {totalCount} {targetUserType}s available
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchTextInput}
            placeholder={searchPlaceholder}
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

      {/* Specialization Filter */}
      {renderSpecializationFilter()}

      {/* Users List */}
      {loading && users.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Finding {targetUserType}s for you...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
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
          onEndReached={() => {
            if (hasMore && !loading) {
              fetchUsers(false);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && users.length > 0 ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#A78BFA" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#666" />
                <Text style={styles.emptyStateText}>
                  {emptyStateText}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery || selectedSpecialization !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'Check back later for new users'
                  }
                </Text>
              </View>
            ) : null
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
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginLeft: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
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
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userSpecialization: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
    marginBottom: 2,
  },
  userExperience: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userType: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  chatButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  certificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  certificationText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  reviewContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  footerLoading: {
    padding: 20,
    alignItems: 'center',
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
  disabledButton: {
    opacity: 0.7,
  },
}); 