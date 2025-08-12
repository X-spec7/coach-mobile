import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import { 
  UserProfileService, 
  UserProfile, 
  ClientProfileUpdateRequest, 
  CoachProfileUpdateRequest,
  Gender,
  WeightUnit,
  HeightUnit,
  Certification
} from './services/userProfileService';

export default function PersonalInformationScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    gender: 'not_specified' as Gender,
    notificationsEnabled: true,
    // Coach-specific fields
    specialization: '',
    yearsOfExperience: 0,
    certifications: [] as Certification[],
    // Client-specific fields
    interests: [] as string[],
    helpCategories: [] as string[],
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
      initializeFormData(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (userProfile: UserProfile) => {
    setFormData({
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      phoneNumber: userProfile.phoneNumber || '',
      address: userProfile.address || '',
      gender: userProfile.gender,
      notificationsEnabled: userProfile.notificationsEnabled,
      specialization: userProfile.coachProfile?.specialization || '',
      yearsOfExperience: userProfile.coachProfile?.yearsOfExperience || 0,
      certifications: userProfile.coachProfile?.certifications || [],
      interests: userProfile.interests.map(interest => interest.name),
      helpCategories: userProfile.helpCategories.map(category => category.name),
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (user?.userType === 'Coach') {
        const coachData: CoachProfileUpdateRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          gender: formData.gender,
          notificationsEnabled: formData.notificationsEnabled,
          specialization: formData.specialization,
          yearsOfExperience: formData.yearsOfExperience,
          certifications: formData.certifications,
        };
        
        const response = await UserProfileService.updateCoachProfile(coachData);
        setProfile(response.user);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        const clientData: ClientProfileUpdateRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          gender: formData.gender,
          notificationsEnabled: formData.notificationsEnabled,
          interests: formData.interests,
          helpCategories: formData.helpCategories,
        };
        
        const response = await UserProfileService.updateClientProfile(clientData);
        setProfile(response.user);
        Alert.alert('Success', 'Profile updated successfully!');
      }
      
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { certificationTitle: '', certificationDetail: '' }]
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const renderField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder?: string,
    multiline = false
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        editable={isEditing}
      />
    </View>
  );

  const renderSwitch = (
    label: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.switchContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={!isEditing}
        trackColor={{ false: '#767577', true: '#A78BFA' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  const renderGenderSelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>Gender</Text>
      <View style={styles.genderContainer}>
        {(['male', 'female', 'not_specified'] as Gender[]).map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.genderOption,
              formData.gender === gender && styles.genderOptionSelected,
              !isEditing && styles.genderOptionDisabled
            ]}
            onPress={() => isEditing && setFormData(prev => ({ ...prev, gender }))}
            disabled={!isEditing}
          >
            <Text style={[
              styles.genderOptionText,
              formData.gender === gender && styles.genderOptionTextSelected
            ]}>
              {gender === 'not_specified' ? 'Not Specified' : gender.charAt(0).toUpperCase() + gender.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCertifications = () => {
    if (user?.userType !== 'Coach') return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {isEditing && (
            <TouchableOpacity onPress={addCertification} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#A78BFA" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
        {formData.certifications.map((cert, index) => (
          <View key={index} style={styles.certificationItem}>
            <TextInput
              style={styles.textInput}
              value={cert.certificationTitle}
              onChangeText={(text) => updateCertification(index, 'certificationTitle', text)}
              placeholder="Certification Title"
              editable={isEditing}
            />
            <TextInput
              style={styles.textInput}
              value={cert.certificationDetail}
              onChangeText={(text) => updateCertification(index, 'certificationDetail', text)}
              placeholder="Certification Detail"
              editable={isEditing}
            />
            {isEditing && (
              <TouchableOpacity
                onPress={() => removeCertification(index)}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={styles.loadingText}>Loading profile...</Text>
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
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          <Ionicons 
            name={isEditing ? "close" : "create-outline"} 
            size={24} 
            color="#A78BFA" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={() => isEditing && setShowAvatarModal(true)}
            style={styles.avatarContainer}
          >
            {profile?.avatarImageUrl ? (
              <Image source={{ uri: profile.avatarImageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#666" />
              </View>
            )}
            {isEditing && (
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{profile?.fullName}</Text>
          <Text style={styles.userEmail}>{profile?.email}</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          {renderField(
            'First Name',
            formData.firstName,
            (text) => setFormData(prev => ({ ...prev, firstName: text })),
            'Enter your first name'
          )}
          {renderField(
            'Last Name',
            formData.lastName,
            (text) => setFormData(prev => ({ ...prev, lastName: text })),
            'Enter your last name'
          )}
          {renderField(
            'Phone Number',
            formData.phoneNumber,
            (text) => setFormData(prev => ({ ...prev, phoneNumber: text })),
            'Enter your phone number'
          )}
          {renderField(
            'Address',
            formData.address,
            (text) => setFormData(prev => ({ ...prev, address: text })),
            'Enter your address',
            true
          )}
          {renderGenderSelector()}
        </View>

        {/* Coach-specific fields */}
        {user?.userType === 'Coach' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            {renderField(
              'Specialization',
              formData.specialization,
              (text) => setFormData(prev => ({ ...prev, specialization: text })),
              'e.g., Strength Training, Yoga, etc.'
            )}
            {renderField(
              'Years of Experience',
              formData.yearsOfExperience.toString(),
              (text) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(text) || 0 })),
              'Enter years of experience'
            )}
            {renderCertifications()}
          </View>
        )}

        {/* Client-specific fields */}
        {user?.userType === 'Client' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            {renderSwitch(
              'Enable Notifications',
              formData.notificationsEnabled,
              (value) => setFormData(prev => ({ ...prev, notificationsEnabled: value }))
            )}
          </View>
        )}

        {/* Save Button */}
        {isEditing && (
          <View style={styles.saveSection}>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Avatar Modal */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAvatarModal(false)}
        >
          <View style={styles.avatarModal}>
            <Text style={styles.avatarModalTitle}>Update Profile Picture</Text>
            <TouchableOpacity style={styles.avatarModalOption}>
              <Ionicons name="camera" size={24} color="#A78BFA" />
              <Text style={styles.avatarModalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarModalOption}>
              <Ionicons name="images" size={24} color="#A78BFA" />
              <Text style={styles.avatarModalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.avatarModalOption, styles.avatarModalOptionDanger]}
              onPress={() => setShowAvatarModal(false)}
            >
              <Ionicons name="close" size={24} color="#FF6B6B" />
              <Text style={[styles.avatarModalOptionText, styles.avatarModalOptionTextDanger]}>
                Cancel
              </Text>
            </TouchableOpacity>
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
  editButton: {
    padding: 4,
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
  avatarSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#A78BFA',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#A78BFA',
    marginLeft: 4,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: '#A78BFA',
    backgroundColor: '#A78BFA20',
  },
  genderOptionDisabled: {
    opacity: 0.6,
  },
  genderOptionText: {
    fontSize: 14,
    color: '#666',
  },
  genderOptionTextSelected: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  certificationItem: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  removeButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  saveSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  avatarModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  avatarModalOptionDanger: {
    marginTop: 10,
  },
  avatarModalOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  avatarModalOptionTextDanger: {
    color: '#FF6B6B',
  },
}); 