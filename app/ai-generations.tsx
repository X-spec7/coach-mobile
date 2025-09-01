import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  getGenerationHistory,
  regeneratePlan,
  Generation,
} from './services/aiPlannerService';

type FilterType = 'all' | 'meal_plan' | 'workout_plan';
type StatusFilter = 'all' | 'completed' | 'processing' | 'failed';

export default function AIGenerationsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'background');

  useEffect(() => {
    loadGenerations();
  }, [filterType, statusFilter]);

  const loadGenerations = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      
      if (filterType !== 'all') {
        params.generation_type = filterType;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await getGenerationHistory(params);
      setGenerations(response.generations);
    } catch (error) {
      console.error('Error loading generations:', error);
      Alert.alert('Error', 'Failed to load generation history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGenerations();
    setRefreshing(false);
  };

  const handleRegenerate = async (generation: Generation) => {
    Alert.alert(
      'Regenerate Plan',
      'Would you like to regenerate this plan with the same parameters?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            try {
              await regeneratePlan({
                generation_id: generation.id,
              });
              Alert.alert('Success', 'Plan regenerated successfully!');
              await loadGenerations();
            } catch (error) {
              console.error('Error regenerating plan:', error);
              Alert.alert('Error', 'Failed to regenerate plan');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'processing': return '#FF9800';
      case 'failed': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'processing': return 'time';
      case 'failed': return 'close-circle';
      default: return 'ellipse';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilteredGenerations = () => {
    return generations.filter(generation => {
      const typeMatch = filterType === 'all' || generation.generation_type === filterType;
      const statusMatch = statusFilter === 'all' || generation.status === statusFilter;
      return typeMatch && statusMatch;
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={styles.title}>AI Generations</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Filters */}
        {showFilters && (
          <ThemedView style={[styles.filtersCard, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles.sectionTitle}>Filters</ThemedText>
            
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Type</ThemedText>
              <View style={styles.filterButtons}>
                {(['all', 'meal_plan', 'workout_plan'] as FilterType[]).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor: filterType === type ? primaryColor : backgroundColor,
                      },
                    ]}
                    onPress={() => setFilterType(type)}
                  >
                    <ThemedText
                      style={[
                        styles.filterButtonText,
                        { color: filterType === type ? 'white' : textColor },
                      ]}
                    >
                      {type === 'all' ? 'All' : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Status</ThemedText>
              <View style={styles.filterButtons}>
                {(['all', 'completed', 'processing', 'failed'] as StatusFilter[]).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor: statusFilter === status ? primaryColor : backgroundColor,
                      },
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <ThemedText
                      style={[
                        styles.filterButtonText,
                        { color: statusFilter === status ? 'white' : textColor },
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ThemedView>
        )}

        {/* Generations List */}
        <View style={styles.generationsContainer}>
          {getFilteredGenerations().length === 0 ? (
            <ThemedView style={[styles.emptyCard, { backgroundColor: cardBackground }]}>
              <Ionicons name="document-outline" size={64} color={textColor + '40'} />
              <ThemedText style={styles.emptyTitle}>No Generations Found</ThemedText>
              <ThemedText style={styles.emptyDescription}>
                {filterType !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Start by generating your first AI plan!'}
              </ThemedText>
              {filterType === 'all' && statusFilter === 'all' && (
                <TouchableOpacity
                  style={[styles.createButton, { backgroundColor: primaryColor }]}
                  onPress={() => router.push('/ai-planner')}
                >
                  <ThemedText style={styles.createButtonText}>Create First Plan</ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          ) : (
            getFilteredGenerations().map(generation => (
              <ThemedView
                key={generation.id}
                style={[styles.generationCard, { backgroundColor: cardBackground }]}
              >
                <View style={styles.generationHeader}>
                  <View style={styles.generationType}>
                    <Ionicons
                      name={generation.generation_type === 'meal_plan' ? 'restaurant' : 'fitness'}
                      size={20}
                      color={primaryColor}
                    />
                    <ThemedText style={styles.generationTypeText}>
                      {generation.generation_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </ThemedText>
                  </View>
                  <View style={styles.generationStatus}>
                    <Ionicons
                      name={getStatusIcon(generation.status)}
                      size={16}
                      color={getStatusColor(generation.status)}
                    />
                    <ThemedText
                      style={[
                        styles.statusText,
                        { color: getStatusColor(generation.status) },
                      ]}
                    >
                      {generation.status.charAt(0).toUpperCase() + generation.status.slice(1)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.generationContent}>
                  <ThemedText style={styles.generationPrompt} numberOfLines={3}>
                    {generation.generation_type === 'meal_plan' ? 'Meal Plan' : 'Workout Plan'} - {generation.status}
                  </ThemedText>
                  
                  <View style={styles.generationDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={14} color={textColor + '60'} />
                      <ThemedText style={styles.detailText}>
                        {formatDate(generation.created_at)}
                      </ThemedText>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="flash-outline" size={14} color={textColor + '60'} />
                      <ThemedText style={styles.detailText}>
                        {generation.tokens_used} tokens
                      </ThemedText>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="cash-outline" size={14} color={textColor + '60'} />
                      <ThemedText style={styles.detailText}>
                        ${generation.cost.toFixed(4)}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={styles.generationActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: primaryColor }]}
                    onPress={() => router.push(`/ai-generation/${generation.id}` as any)}
                  >
                    <Ionicons name="eye" size={16} color="white" />
                    <ThemedText style={styles.actionButtonText}>View</ThemedText>
                  </TouchableOpacity>
                  
                  {generation.status === 'completed' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: textColor + '20' }]}
                      onPress={() => handleRegenerate(generation)}
                    >
                      <Ionicons name="refresh" size={16} color={textColor} />
                      <ThemedText style={[styles.actionButtonText, { color: textColor }]}>
                        Regenerate
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </ThemedView>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filterButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  scrollView: {
    flex: 1,
    paddingTop: 0,
  },
  filtersCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  generationsContainer: {
    padding: 20,
    gap: 16,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  generationCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  generationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  generationType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generationTypeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  generationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  generationContent: {
    padding: 16,
  },
  generationPrompt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  generationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    opacity: 0.7,
  },
  generationActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
}); 