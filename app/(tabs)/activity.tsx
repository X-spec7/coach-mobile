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
      id: 'workout-assignments',
      title: 'Workout Assignments',
      subtitle: 'View assigned workout plans',
      icon: 'clipboard' as const,
      color: '#FFA726',
      onPress: () => router.push('/workout-assignments'),
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
    <View style={[styles.container, { backgroundColor: '#f8f9fa' }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: '#e0e0e0' }]}>
          <Text style={[styles.title, { color: '#1a1a1a' }]}>
            Activity
          </Text>
          <Text style={styles.subtitle}>
            Track your fitness journey and progress
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { 
            backgroundColor: '#fff',
            borderColor: '#e0e0e0'
          }]}>
            <Ionicons name="fitness" size={24} color="#A78BFA" />
            <Text style={[styles.statValue, { color: '#1a1a1a' }]}>15</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={[styles.statCard, { 
            backgroundColor: '#fff',
            borderColor: '#e0e0e0'
          }]}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <Text style={[styles.statValue, { color: '#1a1a1a' }]}>3,420</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={[styles.statCard, { 
            backgroundColor: '#fff',
            borderColor: '#e0e0e0'
          }]}>
            <Ionicons name="trophy" size={24} color="#FFA726" />
            <Text style={[styles.statValue, { color: '#1a1a1a' }]}>5</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View style={styles.chartSection}>
          <Text style={[styles.sectionTitle, { color: '#1a1a1a' }]}>
            Weekly Progress
          </Text>
          <View style={styles.chartContainer}>
            {activityData.map((day, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={[styles.barContainer, { backgroundColor: '#f0f0f0' }]}>
                  <View 
                    style={[
                      styles.bar, 
                      { height: `${(day.calories / maxCalories) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={[styles.chartLabel, { color: '#1a1a1a' }]}>{day.date}</Text>
                <Text style={[styles.chartValue, { color: '#1a1a1a' }]}>
                  {day.calories}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Workout & Fitness Menu */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: '#1a1a1a' }]}>
            Workouts & Training
          </Text>
          
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                { 
                  backgroundColor: '#fff',
                  borderColor: '#e0e0e0',
                }
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, { color: '#1a1a1a' }]}>
                  {item.title}
                </Text>
                <Text style={styles.menuItemSubtitle}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Achievements */}
        <View style={styles.achievementsContainer}>
          <Text style={[styles.sectionTitle, { color: '#1a1a1a' }]}>
            Recent Achievements
          </Text>
          <View style={[styles.achievement, { 
            backgroundColor: '#fff',
            borderColor: '#e0e0e0'
          }]}>
            <View style={styles.achievementIcon}>
              <Ionicons name="trophy" size={24} color="#FFA726" />
            </View>
            <View style={styles.achievementContent}>
              <Text style={[styles.achievementTitle, { color: '#1a1a1a' }]}>
                Workout Warrior
              </Text>
              <Text style={styles.achievementDesc}>
                Completed 5 workouts in a week
              </Text>
            </View>
          </View>

          <View style={[styles.achievement, { 
            backgroundColor: '#fff',
            borderColor: '#e0e0e0'
          }]}>
            <View style={styles.achievementIcon}>
              <Ionicons name="flame" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.achievementContent}>
              <Text style={[styles.achievementTitle, { color: '#1a1a1a' }]}>
                Calorie Crusher
              </Text>
              <Text style={styles.achievementDesc}>
                Burned 3,000+ calories this week
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  menuSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  chartSection: {
    padding: 20,
    paddingTop: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 150,
    width: 30,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 15,
  },
  chartLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  chartValue: {
    fontSize: 12,
    marginTop: 4,
  },
  achievementsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  achievement: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFA72620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});