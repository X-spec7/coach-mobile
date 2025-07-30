import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useColorScheme,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { WorkoutService, PublicWorkoutPlan } from '../services/workoutService';
import { ApplyWorkoutPlanModal } from '../modals/ApplyWorkoutPlanModal';

export default function PublicWorkoutsScreen() {
  const colorScheme = useColorScheme();
  const [workoutPlans, setWorkoutPlans] = useState<PublicWorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PublicWorkoutPlan | null>(null);

  useEffect(() => {
    fetchPublicWorkoutPlans();
  }, []);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        fetchPublicWorkoutPlans(searchQuery);
      } else {
        fetchPublicWorkoutPlans();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchPublicWorkoutPlans = async (search?: string) => {
    setLoading(true);
    try {
      const response = await WorkoutService.getPublicWorkoutPlans({
        search,
        offset: 0,
        limit: 20,
      });
      setWorkoutPlans(response.workout_plans);
    } catch (error) {
      console.error('Error fetching public workout plans:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load public workout plans';
      
      if (errorMessage.includes('Authentication required')) {
        console.log('User not authenticated, skipping fetch');
        setWorkoutPlans([]);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPublicWorkoutPlans(searchQuery || undefined);
    setRefreshing(false);
  };

  const handleApplyPlan = (plan: PublicWorkoutPlan) => {
    setSelectedPlan(plan);
    setShowApplyModal(true);
  };

  const handleApplySuccess = () => {
    setShowApplyModal(false);
    setSelectedPlan(null);
    Alert.alert('Success', 'Workout plan applied successfully! Check your scheduled workouts.');
  };

  const renderWorkoutPlan = ({ item }: { item: PublicWorkoutPlan }) => (
    <View style={[styles.planCard, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text style={[styles.planTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {item.title}
          </Text>
          <Text style={styles.planCreator}>by {item.client_name}</Text>
          {item.description && (
            <Text style={styles.planDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleApplyPlan(item)}
        >
          <Ionicons name="add-circle" size={24} color="#A78BFA" />
        </TouchableOpacity>
      </View>

      <View style={styles.planStats}>
        <View style={styles.statItem}>
          <Ionicons name="calendar" size={16} color="#A78BFA" />
          <Text style={styles.statText}>{item.daily_plans_count} days</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="flame" size={16} color="#A78BFA" />
          <Text style={styles.statText}>{item.total_calories} cal</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#A78BFA" />
          <Text style={styles.statText}>{item.applications_count} applied</Text>
        </View>
        <View style={[styles.statusBadge, {
          backgroundColor: item.status === 'published' ? '#4CAF50' : '#FFA726',
        }]}>
          <Text style={styles.statusText}>{item.status_display}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Public Workouts
          </Text>
          <Text style={styles.headerSubtitle}>
            Discover and apply workout plans from trainers
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInput,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20',
            borderColor: Colors[colorScheme ?? 'light'].tabIconDefault + '40',
          }
        ]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={Colors[colorScheme ?? 'light'].tabIconDefault} 
          />
          <TextInput
            style={[styles.searchTextInput, { color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Search workout plans..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={Colors[colorScheme ?? 'light'].tabIconDefault} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Workout Plans List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            Loading public workout plans...
          </Text>
        </View>
      ) : (
        <FlatList
          data={workoutPlans}
          renderItem={renderWorkoutPlan}
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
              <Ionicons 
                name="fitness" 
                size={64} 
                color={Colors[colorScheme ?? 'light'].tabIconDefault} 
              />
              <Text style={[styles.emptyStateText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                {searchQuery ? 'No workout plans found' : 'No public workout plans available'}
              </Text>
              {searchQuery && (
                <Text style={[styles.emptyStateSubtext, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  Try adjusting your search terms
                </Text>
              )}
            </View>
          }
        />
      )}

      {/* Apply Workout Plan Modal */}
      <ApplyWorkoutPlanModal
        visible={showApplyModal}
        onClose={() => {
          setShowApplyModal(false);
          setSelectedPlan(null);
        }}
        workoutPlan={selectedPlan}
        onSuccess={handleApplySuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  planCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planCreator: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  applyButton: {
    padding: 8,
  },
  planStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    padding: 50,
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
}); 