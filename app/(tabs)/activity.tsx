import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import UnreadMessages from '../components/UnreadMessages';
import WeightDisplay from '../components/WeightDisplay';

export default function ActivityScreen() {
  const { user } = useAuth();
  const { loadContacts } = useChat();
  console.log('ActivityScreen rendering...');

  // Refresh contacts when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadContacts();
    }, [loadContacts])
  );

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

      {/* Weight Display for Clients */}
      {user?.userType === 'Client' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <WeightDisplay />
        </View>
      )}

      {/* Role-based Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {user?.userType === 'Coach' ? 'Coach Tools' : 'Quick Actions'}
        </Text>
        <View style={styles.menuGrid}>
          {user?.userType === 'Coach' ? (
            // Coach Menu Items
            <>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/find-coaches')}
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
                onPress={() => router.push('/coach-sessions')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="videocam" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>My Sessions</Text>
                <Text style={styles.menuSubtitle}>Manage live fitness sessions</Text>
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
                onPress={() => router.push('/sessions')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="videocam" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Live Sessions</Text>
                <Text style={styles.menuSubtitle}>Join live fitness sessions</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/weight-tracking')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="scale" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Weight Tracking</Text>
                <Text style={styles.menuSubtitle}>Monitor your weight progress</Text>
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
                  <Ionicons name="restaurant" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Meal Tracking</Text>
                <Text style={styles.menuSubtitle}>Log daily food consumption</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/calorie-tracking')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="nutrition" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Calorie Tracking</Text>
                <Text style={styles.menuSubtitle}>Track daily calories & macros</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/calorie-goals')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="flag" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Calorie Goals</Text>
                <Text style={styles.menuSubtitle}>Set & manage nutrition goals</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/add-food')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="add-circle" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Add Food</Text>
                <Text style={styles.menuSubtitle}>Search, quick add & manage foods</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/calorie-stats')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="analytics" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.menuTitle}>Calorie Stats</Text>
                <Text style={styles.menuSubtitle}>View nutrition analytics</Text>
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