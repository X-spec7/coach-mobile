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
import { CoachClientService, Coach } from '../services/coachClientService';
import { getAuthHeaders } from '../services/api';
import { API_BASE_URL } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';

export default function FindCoachesScreen() {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

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
      // Test 1: General users endpoint
      console.log('Testing /api/users/...');
      const usersResponse = await fetch(`${API_BASE_URL}/api/users/`, {
        method: 'GET',
        headers,
      });
      console.log('Users endpoint status:', usersResponse.status);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('Users data structure:', usersData);
      }
      
      // Test 2: Users endpoint with Coach filter
      console.log('Testing /api/users/ with Coach filter...');
      const coachResponse = await fetch(`${API_BASE_URL}/api/users/?user_type=Coach`, {
        method: 'GET',
        headers,
      });
      console.log('Coach filter endpoint status:', coachResponse.status);
      if (coachResponse.ok) {
        const coachData = await coachResponse.json();
        console.log('Coach data structure:', coachData);
      }
      
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  useEffect(() => {
    fetchCoaches(true);
    // Uncomment this line to test backend endpoints
    // testBackendEndpoints();
  }, [searchQuery, selectedSpecialization]);

  const fetchCoaches = async (reset = false) => {
    if (loading) return;
    
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

      const response = await CoachClientService.getCoaches(params);
      
      if (reset) {
        setCoaches(response.coaches);
        setOffset(20);
      } else {
        setCoaches(prev => [...prev, ...response.coaches]);
        setOffset(currentOffset + 20);
      }
      
      setTotalCount(response.totalCoachesCount);
      setHasMore(response.coaches.length === 20);
      
    } catch (error) {
      console.error('Error fetching coaches:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load coaches';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('User not authenticated, skipping fetch');
        setCoaches([]);
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        // Backend doesn't support coach endpoints yet
        Alert.alert(
          'Feature Not Available', 
          'The coach-client connection feature is not yet available on this server. Please check back later or contact support.'
        );
        setCoaches([]);
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        Alert.alert(
          'Server Error', 
          'The server is experiencing issues. Please try again later.'
        );
        setCoaches([]);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCoaches(true);
    setRefreshing(false);
  };

  const handleRequestConnection = async (coach: Coach) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to connect with coaches');
      return;
    }

    Alert.alert(
      'Request Connection',
      `Send a connection request to ${coach.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              await CoachClientService.createRelationship({
                coach_id: coach.id,
                client_id: user.id,
                status: 'pending',
                notes: `Hi ${coach.firstName}! I would like to work with you as my coach.`,
              });
              
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

  const renderCoach = ({ item }: { item: Coach }) => (
    <View style={styles.coachCard}>
      <View style={styles.coachHeader}>
        {item.profilePicture ? (
          <Image
            source={{ uri: item.profilePicture }}
            style={styles.coachAvatar}
          />
        ) : (
          <View style={styles.coachAvatarPlaceholder}>
            <Ionicons name="person" size={32} color="#A78BFA" />
          </View>
        )}
        
        <View style={styles.coachInfo}>
          <Text style={styles.coachName}>{item.fullName}</Text>
          <Text style={styles.coachSpecialization}>
            {item.coach_profile.specialization}
          </Text>
          <Text style={styles.coachExperience}>
            {item.coach_profile.yearsOfExperience} years experience
          </Text>
          
          {item.reviews.length > 0 && (
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {renderStars(item.reviews[0].rating)}
              </View>
              <Text style={styles.reviewCount}>
                ({item.reviews.length} reviews)
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => handleRequestConnection(item)}
        >
          <Ionicons name="add-circle" size={24} color="#A78BFA" />
        </TouchableOpacity>
      </View>

      {item.coach_profile.certification && (
        <View style={styles.certificationContainer}>
          <Ionicons name="ribbon" size={16} color="#4CAF50" />
          <Text style={styles.certificationText}>
            {item.coach_profile.certification}
          </Text>
        </View>
      )}

      {item.reviews.length > 0 && (
        <View style={styles.reviewContainer}>
          <Text style={styles.reviewText} numberOfLines={2}>
            "{item.reviews[0].content}"
          </Text>
          <Text style={styles.reviewerName}>
            - {item.reviews[0].reviewerName}
          </Text>
        </View>
      )}
    </View>
  );

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
          <Text style={styles.headerTitle}>Find Coaches</Text>
          <Text style={styles.headerSubtitle}>
            {totalCount} coaches available
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search coaches by name..."
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

      {/* Coaches List */}
      {loading && coaches.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Finding coaches for you...</Text>
        </View>
      ) : (
        <FlatList
          data={coaches}
          renderItem={renderCoach}
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
              fetchCoaches(false);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && coaches.length > 0 ? (
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
                  {searchQuery || selectedSpecialization !== 'All'
                    ? 'No coaches found'
                    : 'No coaches available'
                  }
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery || selectedSpecialization !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'Check back later for new coaches'
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
  coachCard: {
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
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  coachAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  coachAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  coachSpecialization: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
    marginBottom: 2,
  },
  coachExperience: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
  connectButton: {
    padding: 8,
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
}); 