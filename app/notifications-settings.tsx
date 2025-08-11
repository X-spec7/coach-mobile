import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import { 
  UserProfileService, 
  UserProfile, 
  CoachProfileUpdateRequest, 
  ClientProfileUpdateRequest 
} from './services/userProfileService';

interface NotificationSettings {
  generalNotifications: boolean;
  workoutReminders: boolean;
  mealReminders: boolean;
  sessionNotifications: boolean;
  coachMessages: boolean;
  marketingEmails: boolean;
}

export default function NotificationsSettingsScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<NotificationSettings>({
    generalNotifications: true,
    workoutReminders: true,
    mealReminders: true,
    sessionNotifications: true,
    coachMessages: true,
    marketingEmails: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UserProfileService.getUserProfile();
      setProfile(response.user);
      
      // Initialize settings based on profile
      setSettings(prev => ({
        ...prev,
        generalNotifications: response.user.notificationsEnabled,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (user?.userType === 'Coach') {
        const updateData: CoachProfileUpdateRequest = {
          notificationsEnabled: settings.generalNotifications,
        };
        await UserProfileService.updateCoachProfile(updateData);
      } else {
        const updateData: ClientProfileUpdateRequest = {
          notificationsEnabled: settings.generalNotifications,
        };
        await UserProfileService.updateClientProfile(updateData);
      }

      Alert.alert('Success', 'Notification settings updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    settingKey: keyof NotificationSettings,
    disabled = false
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color="#A78BFA" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => toggleSetting(settingKey)}
        disabled={disabled}
        trackColor={{ false: '#767577', true: '#A78BFA' }}
        thumbColor={settings[settingKey] ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchProfile} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#A78BFA" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Notifications</Text>
          {renderSettingItem(
            'notifications',
            'General Notifications',
            'Receive general app notifications and updates',
            'generalNotifications'
          )}
        </View>

        {/* Workout & Fitness */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout & Fitness</Text>
          {renderSettingItem(
            'fitness',
            'Workout Reminders',
            'Get reminded about scheduled workouts',
            'workoutReminders'
          )}
        </View>

        {/* Nutrition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition</Text>
          {renderSettingItem(
            'restaurant',
            'Meal Reminders',
            'Get reminded about meal tracking and plans',
            'mealReminders'
          )}
        </View>

        {/* Sessions & Communication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sessions & Communication</Text>
          {renderSettingItem(
            'videocam',
            'Session Notifications',
            'Get notified about live sessions and bookings',
            'sessionNotifications'
          )}
          {renderSettingItem(
            'chatbubbles',
            'Coach Messages',
            'Receive messages from your coaches',
            'coachMessages'
          )}
        </View>

        {/* Marketing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing</Text>
          {renderSettingItem(
            'mail',
            'Marketing Emails',
            'Receive promotional emails and offers',
            'marketingEmails'
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.infoText}>
            You can change these settings at any time. Some notifications are essential for app functionality.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#A78BFA20',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A78BFA20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 8,
  },
}); 