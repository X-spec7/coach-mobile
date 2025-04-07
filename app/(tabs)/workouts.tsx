import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Clock, Flame } from 'lucide-react-native';

const workoutCategories = [
  {
    id: 1,
    title: 'Strength',
    workouts: 12,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
  },
  {
    id: 2,
    title: 'Cardio',
    workouts: 8,
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500',
  },
  {
    id: 3,
    title: 'Yoga',
    workouts: 6,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
  },
];

export default function WorkoutsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Workout Library</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Clock size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>148</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Flame size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>1,850</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        {workoutCategories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryCard}>
            <Image source={{ uri: category.image }} style={styles.categoryImage} />
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryWorkouts}>{category.workouts} workouts</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
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
  categoryCard: {
    margin: 20,
    marginVertical: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 160,
  },
  categoryContent: {
    padding: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  categoryWorkouts: {
    fontSize: 14,
    color: '#666',
  },
});