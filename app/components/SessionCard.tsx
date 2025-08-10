import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '../services/sessionService';

interface SessionCardProps {
  session: Session;
  onPress: (session: Session) => void;
  showBookButton?: boolean;
  showJoinButton?: boolean;
  onBookPress?: (sessionId: string) => void;
  onJoinPress?: (sessionId: string) => void;
  isBooked?: boolean;
  isLoading?: boolean;
}

const { width } = Dimensions.get('window');

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onPress,
  showBookButton = false,
  showJoinButton = false,
  onBookPress,
  onJoinPress,
  isBooked = false,
  isLoading = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} from now`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} from now`;
    } else {
      return 'Starting soon';
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getGoalIcon = (goal: string) => {
    switch (goal.toLowerCase()) {
      case 'cardio':
        return 'heart';
      case 'strength':
        return 'fitness';
      case 'yoga':
        return 'body';
      case 'flexibility':
        return 'body-outline';
      case 'weight loss':
        return 'trending-down';
      default:
        return 'fitness';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(session)}
      disabled={isLoading}
    >
      {/* Banner Image */}
      {session.bannerImageUrl ? (
        <Image
          source={{ uri: session.bannerImageUrl }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.bannerPlaceholder}>
          <Ionicons name={getGoalIcon(session.goal)} size={32} color="#A78BFA" />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {session.title}
            </Text>
            <View style={styles.coachInfo}>
              <Ionicons name="person" size={12} color="#666" />
              <Text style={styles.coachName}>{session.coachFullname}</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${session.price}</Text>
          </View>
        </View>

        {/* Session Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.detailText}>
              {formatTime(session.startDate)} • {formatDuration(session.duration)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={14} color="#666" />
            <Text style={styles.detailText}>{formatDate(session.startDate)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people" size={14} color="#666" />
            <Text style={styles.detailText}>
              {session.currentParticipantNumber}/{session.totalParticipantNumber} participants
            </Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: getLevelColor(session.level) + '20' }]}>
            <Text style={[styles.tagText, { color: getLevelColor(session.level) }]}>
              {session.level}
            </Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name={getGoalIcon(session.goal)} size={12} color="#A78BFA" />
            <Text style={[styles.tagText, { color: '#A78BFA' }]}>
              {session.goal}
            </Text>
          </View>
        </View>

        {/* Equipment */}
        {session.equipments && session.equipments.length > 0 && (
          <View style={styles.equipment}>
            <Text style={styles.equipmentTitle}>Equipment needed:</Text>
            <Text style={styles.equipmentList}>
              {session.equipments.join(', ')}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {(showBookButton || showJoinButton) && (
          <View style={styles.actions}>
            {showBookButton && !isBooked && (
              <TouchableOpacity
                style={[styles.button, styles.bookButton]}
                onPress={() => onBookPress?.(session.id)}
                disabled={isLoading}
              >
                <Text style={styles.bookButtonText}>
                  {isLoading ? 'Booking...' : 'Book Session'}
                </Text>
              </TouchableOpacity>
            )}

            {showBookButton && isBooked && (
              <View style={[styles.button, styles.bookedButton]}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.bookedButtonText}>Booked</Text>
              </View>
            )}

            {showJoinButton && (
              <TouchableOpacity
                style={[styles.button, styles.joinButton]}
                onPress={() => onJoinPress?.(session.id)}
                disabled={isLoading}
              >
                <Ionicons name="videocam" size={16} color="#fff" />
                <Text style={styles.joinButtonText}>
                  {isLoading ? 'Joining...' : 'Join Session'}
                </Text>
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
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 120,
  },
  bannerPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coachName: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  equipment: {
    marginBottom: 12,
  },
  equipmentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  equipmentList: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  bookButton: {
    backgroundColor: '#A78BFA',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bookedButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  bookedButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SessionCard; 