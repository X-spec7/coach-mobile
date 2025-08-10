import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeightTrackingService, WeightEntry } from '../services/weightTrackingService';
import { router } from 'expo-router';

export const WeightDisplay: React.FC = () => {
  const [latestWeight, setLatestWeight] = useState<WeightEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLatestWeight();
  }, []);

  const fetchLatestWeight = async () => {
    setLoading(true);
    try {
      const response = await WeightTrackingService.getLatestWeightEntry();
      setLatestWeight(response.weight_entry);
    } catch (error) {
      // No latest weight entry found - this is normal for new users
      console.log('No latest weight entry found');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    router.push('/weight-tracking');
  };

  if (loading) {
    return (
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="scale" size={24} color="#A78BFA" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Weight</Text>
            <Text style={styles.subtitle}>Loading...</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </TouchableOpacity>
    );
  }

  if (!latestWeight) {
    return (
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="scale-outline" size={24} color="#A78BFA" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Weight</Text>
            <Text style={styles.subtitle}>Start tracking</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="scale" size={24} color="#A78BFA" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Current Weight</Text>
          <Text style={styles.weightValue}>
            {latestWeight.weight_value} {latestWeight.unit}
          </Text>
          <Text style={styles.date}>
            {new Date(latestWeight.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A78BFA',
  },
  weightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
});

export default WeightDisplay; 