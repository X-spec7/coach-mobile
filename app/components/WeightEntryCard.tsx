import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeightEntry } from '../services/weightTrackingService';

interface WeightEntryCardProps {
  entry: WeightEntry;
  onPress?: (entry: WeightEntry) => void;
  onEdit?: (entry: WeightEntry) => void;
  onDelete?: (entryId: string) => void;
  showActions?: boolean;
}

export const WeightEntryCard: React.FC<WeightEntryCardProps> = ({
  entry,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(entry)}
      disabled={!onPress}
    >
      <View style={styles.content}>
        {/* Date and Time */}
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{formatDate(entry.date)}</Text>
            <Text style={styles.time}>{formatTime(entry.created_at)}</Text>
          </View>
          <View style={styles.weightContainer}>
            <Text style={styles.weightValue}>{entry.weight_value}</Text>
            <Text style={styles.weightUnit}>{entry.unit}</Text>
          </View>
        </View>

        {/* Notes */}
        {entry.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="chatbubble-outline" size={14} color="#666" />
            <Text style={styles.notes} numberOfLines={2}>
              {entry.notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => onEdit(entry)}
              >
                <Ionicons name="pencil" size={16} color="#A78BFA" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(entry.id)}
              >
                <Ionicons name="trash" size={16} color="#F44336" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  weightContainer: {
    alignItems: 'flex-end',
  },
  weightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A78BFA',
  },
  weightUnit: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  notes: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#F3F4F6',
  },
  editButtonText: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
});

export default WeightEntryCard; 