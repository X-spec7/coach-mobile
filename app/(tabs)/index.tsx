import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Play } from 'lucide-react-native';

const workouts = [
    {
        id: 1,
        title: 'Full Body Workout',
        duration: '45 min',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500',
    },
    {
        id: 2,
        title: 'HIIT Training',
        duration: '30 min',
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=500',
    },
];

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Welcome back, Alex!</Text>
                    <Text style={styles.stats}>Today's Goal: 500 calories</Text>
                </View>

                <View style={styles.featuredWorkout}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=500' }}
                        style={styles.featuredImage}
                    />
                    <View style={styles.featuredContent}>
                        <Text style={styles.featuredTitle}>Featured Workout</Text>
                        <Text style={styles.featuredSubtitle}>Core Strength</Text>
                        <TouchableOpacity style={styles.startButton}>
                            <Play size={20} color="#fff" />
                            <Text style={styles.buttonText}>Start Workout</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Recent Workouts</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.workoutList}>
                    {workouts.map((workout) => (
                        <TouchableOpacity key={workout.id} style={styles.workoutCard}>
                            <Image source={{ uri: workout.image }} style={styles.workoutImage} />
                            <View style={styles.workoutInfo}>
                                <Text style={styles.workoutTitle}>{workout.title}</Text>
                                <Text style={styles.workoutDuration}>{workout.duration}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
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
    header: {
        padding: 20,
        paddingTop: 40,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    stats: {
        fontSize: 16,
        color: '#666',
    },
    featuredWorkout: {
        margin: 20,
        backgroundColor: '#2a2a2a',
        borderRadius: 16,
        overflow: 'hidden',
    },
    featuredImage: {
        width: '100%',
        height: 200,
    },
    featuredContent: {
        padding: 20,
    },
    featuredTitle: {
        fontSize: 14,
        color: '#8B5CF6',
        marginBottom: 8,
    },
    featuredSubtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    startButton: {
        backgroundColor: '#8B5CF6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginHorizontal: 20,
        marginBottom: 16,
    },
    workoutList: {
        paddingHorizontal: 20,
    },
    workoutCard: {
        width: 280,
        backgroundColor: '#2a2a2a',
        borderRadius: 16,
        marginRight: 16,
        overflow: 'hidden',
    },
    workoutImage: {
        width: '100%',
        height: 160,
    },
    workoutInfo: {
        padding: 16,
    },
    workoutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    workoutDuration: {
        fontSize: 14,
        color: '#666',
    },
});