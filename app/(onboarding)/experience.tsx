import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const EXPERIENCE_LEVELS = [
    {
        id: 'beginner',
        title: 'Beginner',
        description: 'New to fitness or getting back after a long break',
        icon: 'walking'
    },
    {
        id: 'intermediate',
        title: 'Intermediate',
        description: 'Regular exercise with some experience',
        icon: 'running'
    },
    {
        id: 'advanced',
        title: 'Advanced',
        description: 'Experienced and looking for a challenge',
        icon: 'dumbbell'
    }
];

export default function ExperienceScreen() {
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

    const handleContinue = () => {
        if (selectedLevel) {
            router.push('/auth/sign-up');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>What's your fitness level?</Text>
                <Text style={styles.subtitle}>This helps us create your perfect program</Text>

                <View style={styles.levelsContainer}>
                    {EXPERIENCE_LEVELS.map((level) => (
                        <TouchableOpacity
                            key={level.id}
                            style={[
                                styles.levelItem,
                                selectedLevel === level.id && styles.levelItemSelected
                            ]}
                            onPress={() => setSelectedLevel(level.id)}
                        >
                            <View style={styles.levelHeader}>
                                <FontAwesome5
                                    name={level.icon}
                                    size={24}
                                    color={selectedLevel === level.id ? '#fff' : '#666'}
                                />
                                <Text style={[
                                    styles.levelTitle,
                                    selectedLevel === level.id && styles.textSelected
                                ]}>
                                    {level.title}
                                </Text>
                            </View>
                            <Text style={[
                                styles.levelDescription,
                                selectedLevel === level.id && styles.textSelected
                            ]}>
                                {level.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        !selectedLevel && styles.buttonDisabled
                    ]}
                    onPress={handleContinue}
                    disabled={!selectedLevel}
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
    levelsContainer: {
        gap: 16,
    },
    levelItem: {
        padding: 20,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        gap: 12,
    },
    levelItemSelected: {
        backgroundColor: '#7C3AED',
    },
    levelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    levelTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    levelDescription: {
        fontSize: 14,
        color: '#666',
    },
    textSelected: {
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