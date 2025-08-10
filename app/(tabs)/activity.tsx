import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import UnreadMessages from '../components/UnreadMessages';

const activityData = [
  { date: 'Mon', calories: 450 },
  { date: 'Tue', calories: 380 },
  { date: 'Wed', calories: 520 },
  { date: 'Thu', calories: 490 },
  { date: 'Fri', calories: 600 },
  { date: 'Sat', calories: 420 },
  { date: 'Sun', calories: 550 },
];

export default function ActivityScreen() {
  const { user } = useAuth();
  console.log('ActivityScreen rendering...');

  const maxCalories = Math.max(...activityData.map(d => d.calories));

  const menuItems = [
    {
      id: 'my-workouts',
      title: 'My Workouts',
      subtitle: 'Track your scheduled workout sessions',
      icon: 'fitness' as const,
      color: '#A78BFA',
      onPress: () => router.push('/scheduled-workouts'),
    },
    {
      id: 'public-workouts',
      title: 'Public Workouts',
      subtitle: 'Discover and apply workout plans from trainers',
      icon: 'globe' as const,
      color: '#4CAF50',
      onPress: () => router.push('/public-workouts'),
    },
    {
      id: 'connections',
      title: 'My Connections',
      subtitle: 'Manage coach-client relationships',
      icon: 'people' as const,
      color: '#FF6B6B',
      onPress: () => router.push('/connections'),
    },
    {
      id: 'find-coaches',
      title: 'Find Coaches',
      subtitle: 'Connect with fitness professionals',
      icon: 'search' as const,
      color: '#29B6F6',
      onPress: () => router.push('/find-coaches'),
    },
    {
      id: 'workout-history',
      title: 'Workout History',
      subtitle: 'View your workout performance over time',
      icon: 'bar-chart' as const,
      color: '#9C27B0',
      onPress: () => {
        // TODO: Implement workout history view
        console.log('Workout history pressed');
      },
    },
    {
      id: 'achievements',
      title: 'Achievements',
      subtitle: 'View your fitness milestones and badges',
      icon: 'trophy' as const,
      color: '#4CAF50',
      onPress: () => {
        // TODO: Implement achievements view
        console.log('Achievements pressed');
      },
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Track your progress and manage your fitness journey
        </Text>
      </View>

      {/* Unread Messages */}
      <UnreadMessages />

      {/* Weekly Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>5</Text>
            <Text style={styles.progressLabel}>Workouts</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>12</Text>
            <Text style={styles.progressLabel}>Hours</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>850</Text>
            <Text style={styles.progressLabel}>Calories</Text>
          </View>
        </View>
      </View>

      {/* Role-based Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {user?.userType === 'Coach' ? 'Coach Tools' : 'Workouts & Training'}
        </Text>
        <View style={styles.menuGrid}>
          {user?.userType === 'Coach' ? (
            // Coach Menu Items
            <>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/find-coaches')} // Will be renamed to find-clients for coaches
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="people" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Find Clients</Text>
                <Text style={styles.menuSubtitle}>Connect with new clients</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/connections')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="link" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>My Clients</Text>
                <Text style={styles.menuSubtitle}>Manage client relationships</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/public-workouts')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="globe" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Public Library</Text>
                <Text style={styles.menuSubtitle}>Browse community workouts</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Client Menu Items
            <>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/scheduled-workouts')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="calendar" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>My Schedule</Text>
                <Text style={styles.menuSubtitle}>View scheduled workouts</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/public-workouts')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="search" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Discover Programs</Text>
                <Text style={styles.menuSubtitle}>Find new workout plans</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/find-coaches')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="person-add" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Find Coaches</Text>
                <Text style={styles.menuSubtitle}>Connect with fitness experts</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/connections')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="fitness" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>My Coaches</Text>
                <Text style={styles.menuSubtitle}>Manage coach relationships</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/scheduled-meals')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="checkbox" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Meal Tracking</Text>
                <Text style={styles.menuSubtitle}>Log daily food consumption</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  section: {
    margin: 20,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A78BFA',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#A78BFA20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});