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
import { WeightTrackingService, WeightEntry, WeightStatistics } from '../services/weightTrackingService';
import { useAuth } from '../contexts/AuthContext';
import WeightEntryCard from '../components/WeightEntryCard';
import WeightStatsCard from '../components/WeightStatsCard';
import WeightLogModal from '../modals/WeightLogModal';

export default function WeightTrackingScreen() {
  const { user } = useAuth();
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [statistics, setStatistics] = useState<WeightStatistics | null>(null);
  const [latestEntry, setLatestEntry] = useState<WeightEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);

  const limit = 20;

  useEffect(() => {
    fetchWeightData(true);
    fetchLatestEntry();
  }, []);

  useEffect(() => {
    if (dateFrom || dateTo) {
      fetchWeightData(true);
    }
  }, [dateFrom, dateTo]);

  const fetchWeightData = async (reset: boolean = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const newOffset = reset ? 0 : offset;
      
      const response = await WeightTrackingService.getWeightHistory({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit,
        offset: newOffset,
      });

      const newEntries = response.weight_entries;
      setHasMore(newEntries.length === limit);
      setStatistics(response.statistics);
      
      if (reset) {
        setWeightEntries(newEntries);
        setOffset(newEntries.length);
      } else {
        setWeightEntries(prev => [...prev, ...newEntries]);
        setOffset(prev => prev + newEntries.length);
      }
    } catch (error) {
      console.error('Error fetching weight data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load weight data';
      setError(errorMessage);
      if (reset) {
        setWeightEntries([]);
        setStatistics(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestEntry = async () => {
    try {
      const response = await WeightTrackingService.getLatestWeightEntry();
      setLatestEntry(response.weight_entry);
    } catch (error) {
      // Latest entry not found is not an error - user might not have any entries yet
      console.log('No latest weight entry found');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setOffset(0);
    setHasMore(true);
    await fetchWeightData(true);
    await fetchLatestEntry();
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchWeightData(false);
    }
  };

  const handleLogWeight = () => {
    setEditingEntry(null);
    setShowLogModal(true);
  };

  const handleEditEntry = (entry: WeightEntry) => {
    setEditingEntry(entry);
    setShowLogModal(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this weight entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await WeightTrackingService.deleteWeightEntry(entryId);
              Alert.alert('Success', 'Weight entry deleted successfully!');
              fetchWeightData(true);
              fetchLatestEntry();
            } catch (error) {
              console.error('Error deleting weight entry:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to delete weight entry';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleWeightLogged = () => {
    fetchWeightData(true);
    fetchLatestEntry();
  };

  const clearDateFilters = () => {
    setDateFrom('');
    setDateTo('');
  };

  const renderWeightEntry = ({ item }: { item: WeightEntry }) => (
    <WeightEntryCard
      entry={item}
      onEdit={handleEditEntry}
      onDelete={handleDeleteEntry}
      showActions={true}
    />
  );

  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#A78BFA" />
        <Text style={styles.loadingText}>Loading more entries...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.emptyStateText}>Loading weight data...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="scale-outline" size={64} color="#666" />
        <Text style={styles.emptyStateText}>No weight entries yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Start logging your weight to track your progress
        </Text>
        <TouchableOpacity
          style={styles.logFirstButton}
          onPress={handleLogWeight}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.logFirstButtonText}>Log First Entry</Text>
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
          <Text style={styles.headerTitle}>Weight Tracking</Text>
          <Text style={styles.headerSubtitle}>
            Monitor your weight progress over time
          </Text>
        </View>
      </View>

      {/* Quick Log Button */}
      <View style={styles.quickLogContainer}>
        <TouchableOpacity
          style={styles.quickLogButton}
          onPress={handleLogWeight}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.quickLogButtonText}>Log Today's Weight</Text>
        </TouchableOpacity>
      </View>

      {/* Latest Weight Display */}
      {latestEntry && (
        <View style={styles.latestWeightContainer}>
          <View style={styles.latestWeightHeader}>
            <Ionicons name="scale" size={20} color="#A78BFA" />
            <Text style={styles.latestWeightTitle}>Latest Weight</Text>
          </View>
          <View style={styles.latestWeightContent}>
            <Text style={styles.latestWeightValue}>
              {latestEntry.weight_value} {latestEntry.unit}
            </Text>
            <Text style={styles.latestWeightDate}>
              {new Date(latestEntry.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      )}

      {/* Date Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.filterLabel}>From:</Text>
            <TextInput
              style={styles.dateInput}
              value={dateFrom}
              onChangeText={setDateFrom}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.dateInputContainer}>
            <Text style={styles.filterLabel}>To:</Text>
            <TextInput
              style={styles.dateInput}
              value={dateTo}
              onChangeText={setDateTo}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>
        {(dateFrom || dateTo) && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearDateFilters}
          >
            <Ionicons name="close-circle" size={16} color="#666" />
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Statistics */}
      {statistics && (
        <WeightStatsCard statistics={statistics} />
      )}

      {/* Weight Entries List */}
      <FlatList
        data={weightEntries}
        renderItem={renderWeightEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.entriesList}
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
            onPress={() => fetchWeightData(true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Weight Log Modal */}
      <WeightLogModal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        onWeightLogged={handleWeightLogged}
        editingEntry={editingEntry}
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
  quickLogContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quickLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A78BFA',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickLogButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  latestWeightContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  latestWeightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  latestWeightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  latestWeightContent: {
    alignItems: 'center',
  },
  latestWeightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#A78BFA',
    marginBottom: 4,
  },
  latestWeightDate: {
    fontSize: 14,
    color: '#666',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    gap: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#666',
  },
  entriesList: {
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
  logFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  logFirstButtonText: {
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