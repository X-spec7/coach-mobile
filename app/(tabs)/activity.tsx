import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';

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
  
  try {
    const maxCalories = Math.max(...activityData.map(d => d.calories));

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Activity</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>3,420</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <View style={styles.chartContainer}>
            {activityData.map((day, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { height: `${(day.calories / maxCalories) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.chartLabel}>{day.date}</Text>
                <Text style={styles.chartValue}>{day.calories}</Text>
              </View>
            ))}
          </View>

          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <View style={styles.achievement}>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Workout Warrior</Text>
                <Text style={styles.achievementDesc}>Completed 5 workouts in a week</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  } catch (error) {
    console.error('ActivityScreen error:', error);
    return (
      <View style={styles.container}>
        <Text style={{color: '#fff', textAlign: 'center', marginTop: 50}}>
          Error loading activity
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    margin: 20,
    marginTop: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
    padding: 20,
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
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 15,
  },
  chartLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  chartValue: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  achievementsContainer: {
    padding: 20,
  },
  achievement: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementContent: {
    marginLeft: 16,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
  },
});