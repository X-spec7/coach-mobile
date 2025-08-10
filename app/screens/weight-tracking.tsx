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
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  
  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'from' | 'to'>('from');
  const [tempDate, setTempDate] = useState(new Date());

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
      'Delete Weight Entry',
      'Are you sure you want to delete this weight entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await WeightTrackingService.deleteWeightEntry(entryId);
              Alert.alert('Success', 'Weight entry deleted successfully');
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

  // Date picker functions
  const openDatePicker = (mode: 'from' | 'to') => {
    setDatePickerMode(mode);
    const currentDate = mode === 'from' && dateFrom ? new Date(dateFrom) : 
                       mode === 'to' && dateTo ? new Date(dateTo) : new Date();
    setTempDate(currentDate);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setTempDate(selectedDate);
      
      if (Platform.OS === 'ios') {
        return;
      }
      
      const dateString = selectedDate.toISOString().split('T')[0];
      if (datePickerMode === 'from') {
        setDateFrom(dateString);
      } else {
        setDateTo(dateString);
      }
    }
  };

  const confirmDate = () => {
    const dateString = tempDate.toISOString().split('T')[0];
    if (datePickerMode === 'from') {
      setDateFrom(dateString);
    } else {
      setDateTo(dateString);
    }
    setShowDatePicker(false);
  };

  const cancelDate = () => {
    setShowDatePicker(false);
  };

  // Quick date range functions
  const setDateRange = (range: 'today' | 'week' | 'month' | 'all') => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    switch (range) {
      case 'today':
        setDateFrom(todayString);
        setDateTo(todayString);
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        setDateFrom(weekAgo.toISOString().split('T')[0]);
        setDateTo(todayString);
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        setDateFrom(monthAgo.toISOString().split('T')[0]);
        setDateTo(todayString);
        break;
      case 'all':
        setDateFrom('');
        setDateTo('');
        break;
    }
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderWeightEntry = ({ item }: { item: WeightEntry }) => (
    <WeightEntryCard
      entry={item}
      onPress={() => handleEditEntry(item)}
      onEdit={() => handleEditEntry(item)}
      onDelete={() => handleDeleteEntry(item.id)}
      showActions={true}
    />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#A78BFA" />
        <Text style={styles.footerText}>Loading more entries...</Text>
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

      {/* Quick Date Range Buttons */}
      <View style={styles.quickFiltersContainer}>
        <Text style={styles.quickFiltersTitle}>Quick Filters</Text>
        <View style={styles.quickFiltersRow}>
          <TouchableOpacity
            style={[styles.quickFilterButton, dateFrom && dateTo && dateFrom === dateTo && new Date().toISOString().split('T')[0] === dateFrom && styles.quickFilterButtonActive]}
            onPress={() => setDateRange('today')}
          >
            <Text style={[styles.quickFilterText, dateFrom && dateTo && dateFrom === dateTo && new Date().toISOString().split('T')[0] === dateFrom && styles.quickFilterTextActive]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickFilterButton, dateFrom && dateTo && (() => {
              const today = new Date();
              const weekAgo = new Date(today);
              weekAgo.setDate(today.getDate() - 7);
              return dateFrom === weekAgo.toISOString().split('T')[0] && dateTo === today.toISOString().split('T')[0];
            })() && styles.quickFilterButtonActive]}
            onPress={() => setDateRange('week')}
          >
            <Text style={[styles.quickFilterText, dateFrom && dateTo && (() => {
              const today = new Date();
              const weekAgo = new Date(today);
              weekAgo.setDate(today.getDate() - 7);
              return dateFrom === weekAgo.toISOString().split('T')[0] && dateTo === today.toISOString().split('T')[0];
            })() && styles.quickFilterTextActive]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickFilterButton, dateFrom && dateTo && (() => {
              const today = new Date();
              const monthAgo = new Date(today);
              monthAgo.setMonth(today.getMonth() - 1);
              return dateFrom === monthAgo.toISOString().split('T')[0] && dateTo === today.toISOString().split('T')[0];
            })() && styles.quickFilterButtonActive]}
            onPress={() => setDateRange('month')}
          >
            <Text style={[styles.quickFilterText, dateFrom && dateTo && (() => {
              const today = new Date();
              const monthAgo = new Date(today);
              monthAgo.setMonth(today.getMonth() - 1);
              return dateFrom === monthAgo.toISOString().split('T')[0] && dateTo === today.toISOString().split('T')[0];
            })() && styles.quickFilterTextActive]}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickFilterButton, !dateFrom && !dateTo && styles.quickFilterButtonActive]}
            onPress={() => setDateRange('all')}
          >
            <Text style={[styles.quickFilterText, !dateFrom && !dateTo && styles.quickFilterTextActive]}>All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Date Range */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Custom Date Range</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => openDatePicker('from')}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <View style={styles.dateButtonContent}>
              <Text style={styles.dateButtonLabel}>From</Text>
              <Text style={styles.dateButtonValue}>{formatDateDisplay(dateFrom)}</Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => openDatePicker('to')}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <View style={styles.dateButtonContent}>
              <Text style={styles.dateButtonLabel}>To</Text>
              <Text style={styles.dateButtonValue}>{formatDateDisplay(dateTo)}</Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
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
      />

      {/* Weight Log Modal */}
      <WeightLogModal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        onWeightLogged={handleWeightLogged}
        editingEntry={editingEntry}
      />

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>
                  Select {datePickerMode === 'from' ? 'Start' : 'End'} Date
                </Text>
                <TouchableOpacity onPress={cancelDate}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
              
              {Platform.OS === 'ios' && (
                <View style={styles.datePickerActions}>
                  <TouchableOpacity style={styles.datePickerButton} onPress={cancelDate}>
                    <Text style={styles.datePickerButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.datePickerButton, styles.datePickerButtonConfirm]} onPress={confirmDate}>
                    <Text style={[styles.datePickerButtonText, styles.datePickerButtonTextConfirm]}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
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
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
  },
  dateButtonContent: {
    marginLeft: 10,
  },
  dateButtonLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dateButtonValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  footerText: {
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
  quickFiltersContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quickFiltersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickFiltersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  quickFilterButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 5,
    marginVertical: 8,
  },
  quickFilterButtonActive: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  quickFilterTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  datePickerButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A78BFA',
  },
  datePickerButtonConfirm: {
    backgroundColor: '#A78BFA',
  },
  datePickerButtonTextConfirm: {
    color: '#fff',
  },
}); 