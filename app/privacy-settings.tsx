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
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import { UserProfileService, UserProfile } from './services/userProfileService';
import { 
  getPrivacySettings, 
  updatePrivacySettings, 
  changePassword, 
  requestAccountDeletion,
  cancelAccountDeletion,
  getSecurityInfo,
  PrivacySettings,
  ChangePasswordRequest,
  AccountDeletionRequest
} from './services/privacySecurityService';

export default function PrivacySettingsScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [settings, setSettings] = useState<PrivacySettings>({
    profile_visibility: true,
    data_collection: false,
    analytics: true,
    marketing_communications: false,
  });
  const [securityInfo, setSecurityInfo] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [deletionData, setDeletionData] = useState<AccountDeletionRequest>({
    password: '',
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileResponse, privacyResponse, securityResponse] = await Promise.all([
        UserProfileService.getUserProfile(),
        getPrivacySettings(),
        getSecurityInfo(),
      ]);
      
      setProfile(profileResponse.user);
      setSettings(privacyResponse.privacy_settings);
      setSecurityInfo(securityResponse.security_info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await updatePrivacySettings(settings);
      Alert.alert('Success', 'Privacy settings updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChangePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      await changePassword(passwordData);
      Alert.alert('Success', 'Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!deletionData.password) {
      Alert.alert('Error', 'Please enter your password to confirm account deletion');
      return;
    }

    try {
      setSaving(true);
      const response = await requestAccountDeletion(deletionData);
      Alert.alert(
        'Deletion Requested', 
        `Account deletion requested successfully. Your account will be deleted on ${new Date(response.deletion_scheduled_at).toLocaleDateString()}. Check your email for confirmation.`
      );
      setShowDeletionModal(false);
      setDeletionData({ password: '', reason: '' });
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to request account deletion');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (securityInfo?.deletion_requested_at) {
      Alert.alert(
        'Account Deletion Already Requested',
        'You have already requested account deletion. Check your email for confirmation or contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    setShowDeletionModal(true);
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    settingKey: keyof PrivacySettings,
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

  const renderActionItem = (
    icon: string,
    title: string,
    description: string,
    onPress: () => void,
    danger = false
  ) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={[styles.settingIcon, danger && styles.dangerIcon]}>
        <Ionicons name={icon as any} size={24} color={danger ? '#FF6B6B' : '#A78BFA'} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
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
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
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
        {/* Profile Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Privacy</Text>
          {renderSettingItem(
            'eye',
            'Profile Visibility',
            'Allow others to see your profile',
            'profile_visibility'
          )}
        </View>

        {/* Data & Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Analytics</Text>
          {renderSettingItem(
            'analytics',
            'Data Collection',
            'Allow us to collect usage data',
            'data_collection'
          )}
          {renderSettingItem(
            'bar-chart',
            'Analytics',
            'Help us improve the app with analytics',
            'analytics'
          )}
          {renderSettingItem(
            'mail',
            'Marketing Communications',
            'Receive promotional content',
            'marketing_communications'
          )}
        </View>

        {/* Account Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          {renderActionItem(
            'key',
            'Change Password',
            'Update your account password',
            () => setShowPasswordModal(true)
          )}
        </View>

        {/* Account Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          {renderActionItem(
            'trash',
            'Delete Account',
            'Permanently delete your account and data',
            handleDeleteAccount,
            true
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.infoText}>
            Your privacy is important to us. We never share your personal information with third parties without your consent.
          </Text>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPasswordModal(false)}
        >
          <View style={styles.passwordModal}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Current Password"
              secureTextEntry
              value={passwordData.current_password}
              onChangeText={(text: string) => setPasswordData(prev => ({ ...prev, current_password: text }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              secureTextEntry
              value={passwordData.new_password}
              onChangeText={(text: string) => setPasswordData(prev => ({ ...prev, new_password: text }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              secureTextEntry
              value={passwordData.confirm_password}
              onChangeText={(text: string) => setPasswordData(prev => ({ ...prev, confirm_password: text }))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleChangePassword}
                disabled={saving}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  {saving ? 'Changing...' : 'Change Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Account Deletion Modal */}
      <Modal
        visible={showDeletionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeletionModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDeletionModal(false)}
        >
          <View style={styles.deleteModal}>
            <Ionicons name="warning" size={48} color="#FF6B6B" />
            <Text style={styles.deleteModalTitle}>Delete Account</Text>
            <Text style={styles.deleteModalText}>
              This action cannot be undone. Your account will be deleted after 30 days. Enter your password to confirm.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your password"
              secureTextEntry
              value={deletionData.password}
              onChangeText={(text: string) => setDeletionData(prev => ({ ...prev, password: text }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Reason for deletion (optional)"
              value={deletionData.reason}
              onChangeText={(text: string) => setDeletionData(prev => ({ ...prev, reason: text }))}
            />
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteModalButton}
                onPress={() => setShowDeletionModal(false)}
              >
                <Text style={styles.deleteModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonDanger]}
                onPress={handleRequestDeletion}
                disabled={saving}
              >
                <Text style={[styles.deleteModalButtonText, styles.deleteModalButtonTextDanger]}>
                  {saving ? 'Requesting...' : 'Delete Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
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
  actionItem: {
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
  dangerIcon: {
    backgroundColor: '#FF6B6B20',
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
  dangerText: {
    color: '#FF6B6B',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 12,
  },
  deleteModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  deleteModalButtonDanger: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B',
  },
  deleteModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteModalButtonTextDanger: {
    color: '#fff',
  },
  // Password Modal Styles
  passwordModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    borderColor: '#A78BFA',
    backgroundColor: '#A78BFA',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonTextPrimary: {
    color: '#fff',
  },
}); 