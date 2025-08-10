import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeightStatistics } from '../services/weightTrackingService';

interface WeightStatsCardProps {
  statistics: WeightStatistics;
}

export const WeightStatsCard: React.FC<WeightStatsCardProps> = ({
  statistics,
}) => {
  const getWeightChangeColor = (weightChange: number) => {
    if (weightChange > 0) {
      return '#F44336'; // Red for weight gain
    } else if (weightChange < 0) {
      return '#4CAF50'; // Green for weight loss
    }
    return '#666'; // Gray for no change
  };

  const getWeightChangeIcon = (weightChange: number) => {
    if (weightChange > 0) {
      return 'trending-up';
    } else if (weightChange < 0) {
      return 'trending-down';
    }
    return 'remove';
  };

  const formatWeightChange = (weightChange: number) => {
    const sign = weightChange > 0 ? '+' : '';
    return `${sign}${weightChange.toFixed(1)}`;
  };

  const formatWeight = (weight: number) => {
    return weight.toFixed(1);
  };

  if (statistics.total_entries === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="scale-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No weight data yet</Text>
        <Text style={styles.emptySubtext}>Start logging your weight to see statistics</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics" size={24} color="#A78BFA" />
        <Text style={styles.title}>Weight Statistics</Text>
      </View>

      <View style={styles.statsGrid}>
        {/* Current Weight */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="scale" size={20} color="#A78BFA" />
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <Text style={styles.statValue}>
            {formatWeight(statistics.average_weight)} {statistics.unit}
          </Text>
        </View>

        {/* Weight Change */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons 
              name={getWeightChangeIcon(statistics.weight_change)} 
              size={20} 
              color={getWeightChangeColor(statistics.weight_change)} 
            />
            <Text style={styles.statLabel}>Change</Text>
          </View>
          <Text style={[styles.statValue, { color: getWeightChangeColor(statistics.weight_change) }]}>
            {formatWeightChange(statistics.weight_change)} {statistics.unit}
          </Text>
        </View>

        {/* Min Weight */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="arrow-down" size={20} color="#4CAF50" />
            <Text style={styles.statLabel}>Lowest</Text>
          </View>
          <Text style={styles.statValue}>
            {formatWeight(statistics.min_weight)} {statistics.unit}
          </Text>
        </View>

        {/* Max Weight */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="arrow-up" size={20} color="#F44336" />
            <Text style={styles.statLabel}>Highest</Text>
          </View>
          <Text style={styles.statValue}>
            {formatWeight(statistics.max_weight)} {statistics.unit}
          </Text>
        </View>
      </View>

      {/* Additional Info */}
      <View style={styles.additionalInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.infoText}>{statistics.date_range}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="list" size={16} color="#666" />
          <Text style={styles.infoText}>
            {statistics.total_entries} {statistics.total_entries === 1 ? 'entry' : 'entries'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});

export default WeightStatsCard; 