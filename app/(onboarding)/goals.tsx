import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const GOALS = [
    { id: 1, title: 'Lose Weight', icon: 'weight' },
    { id: 2, title: 'Build Muscle', icon: 'dumbbell' },
    { id: 3, title: 'Improve Fitness', icon: 'running' },
    { id: 4, title: 'Reduce Stress', icon: 'spa' },
    { id: 5, title: 'Better Sleep', icon: 'bed' },
];

export default function GoalsScreen() {
    const [selectedGoals, setSelectedGoals] = useState<number[]>([]);

    const toggleGoal = (goalId: number) => {
        setSelectedGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(id => id !== goalId)
                : [...prev, goalId]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                <Text style={styles.title}>What are your goals?</Text>
                <Text style={styles.subtitle}>Select all that apply</Text>

                <View style={styles.goalsContainer}>
                    {GOALS.map((goal) => (
                        <TouchableOpacity
                            key={goal.id}
                            style={[
                                styles.goalItem,
                                selectedGoals.includes(goal.id) && styles.goalItemSelected
                            ]}
                            onPress={() => toggleGoal(goal.id)}
                        >
                            <FontAwesome5
                                name={goal.icon}
                                size={24}
                                color={selectedGoals.includes(goal.id) ? '#fff' : '#666'}
                            />
                            <Text style={[
                                styles.goalText,
                                selectedGoals.includes(goal.id) && styles.goalTextSelected
                            ]}>
                                {goal.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        selectedGoals.length === 0 && styles.buttonDisabled
                    ]}
                    onPress={() => selectedGoals.length > 0 && router.push('/(onboarding)/experience')}
                    disabled={selectedGoals.length === 0}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    goalsContainer: {
        gap: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 24,
    },
    goalItem: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
        height: 100,
        padding: 20,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        gap: 16,
    },
    goalItemSelected: {
        backgroundColor: '#7C3AED',
    },
    goalText: {
        fontSize: 18,
        color: '#333',
        fontWeight: '500',
    },
    goalTextSelected: {
        color: '#fff',
    },
    buttonContainer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    button: {
        backgroundColor: '#7C3AED',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#d1d1d1',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
}); 