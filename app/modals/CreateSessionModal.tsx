import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SessionService, CreateSessionRequest } from '../services/sessionService';

interface CreateSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onSessionCreated?: () => void;
}

const GOAL_OPTIONS = [
  'Cardio',
  'Strength',
  'Yoga',
  'Flexibility',
  'Weight Loss',
  'HIIT',
  'Pilates',
  'CrossFit',
  'Boxing',
  'Dance',
];

const LEVEL_OPTIONS = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

const EQUIPMENT_OPTIONS = [
  'Dumbbells',
  'Yoga Mat',
  'Resistance Bands',
  'Foam Roller',
  'Kettlebell',
  'Medicine Ball',
  'Jump Rope',
  'Pull-up Bar',
  'Bench',
  'None',
];

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  visible,
  onClose,
  onSessionCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');
  const [totalParticipants, setTotalParticipants] = useState('10');
  const [price, setPrice] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setStartDate(tomorrow.toISOString().split('T')[0]);
      setStartTime('10:00');
    } else {
      // Reset form when modal closes
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setTitle('');
    setStartDate('');
    setStartTime('');
    setDuration('60');
    setGoal('');
    setLevel('');
    setDescription('');
    setTotalParticipants('10');
    setPrice('');
    setSelectedEquipment([]);
    setShowGoalPicker(false);
    setShowLevelPicker(false);
    setBannerImage(null);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setBannerImage(base64Image);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    setBannerImage(null);
  };

  const toggleEquipment = (equipment: string) => {
    if (equipment === 'None') {
      setSelectedEquipment([]);
      return;
    }
    
    setSelectedEquipment(prev => {
      if (prev.includes(equipment)) {
        return prev.filter(item => item !== equipment);
      } else {
        return [...prev, equipment];
      }
    });
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a session title');
      return false;
    }
    if (!startDate) {
      Alert.alert('Error', 'Please select a start date');
      return false;
    }
    if (!startTime) {
      Alert.alert('Error', 'Please select a start time');
      return false;
    }
    if (!duration || parseInt(duration) < 15 || parseInt(duration) > 180) {
      Alert.alert('Error', 'Duration must be between 15 and 180 minutes');
      return false;
    }
    if (!goal) {
      Alert.alert('Error', 'Please select a fitness goal');
      return false;
    }
    if (!level) {
      Alert.alert('Error', 'Please select a difficulty level');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a session description');
      return false;
    }
    if (!totalParticipants || parseInt(totalParticipants) < 1 || parseInt(totalParticipants) > 50) {
      Alert.alert('Error', 'Total participants must be between 1 and 50');
      return false;
    }
    if (!price || parseFloat(price) < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    return true;
  };

  const handleCreateSession = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Combine date and time
      const dateTimeString = `${startDate}T${startTime}:00Z`;
      
      const sessionData: CreateSessionRequest = {
        title: title.trim(),
        startDate: dateTimeString,
        duration: parseInt(duration),
        goal,
        level,
        description: description.trim(),
        totalParticipantNumber: parseInt(totalParticipants),
        price: parseFloat(price),
        equipments: selectedEquipment.length > 0 ? selectedEquipment : undefined,
        bannerImage: bannerImage || undefined,
      };

      const response = await SessionService.createSession(sessionData);
      
      Alert.alert(
        'Success',
        'Session created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              onSessionCreated?.();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPicker = (
    visible: boolean,
    onClose: () => void,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    title: string
  ) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.pickerOption,
                  selectedValue === option && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    selectedValue === option && styles.pickerOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {selectedValue === option && (
                  <Ionicons name="checkmark" size={20} color="#A78BFA" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Session</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <Text style={styles.label}>Session Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter session title"
                maxLength={100}
              />

              <Text style={styles.label}>Start Date *</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Start Time *</Text>
              <TextInput
                style={styles.input}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM (24-hour format)"
              />

              <Text style={styles.label}>Duration (minutes) *</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="60"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            {/* Session Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Details</Text>
              
              <Text style={styles.label}>Fitness Goal *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowGoalPicker(true)}
              >
                <Text style={[styles.pickerButtonText, !goal && styles.placeholderText]}>
                  {goal || 'Select fitness goal'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <Text style={styles.label}>Difficulty Level *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowLevelPicker(true)}
              >
                <Text style={[styles.pickerButtonText, !level && styles.placeholderText]}>
                  {level || 'Select difficulty level'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what participants can expect from this session..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* Pricing & Capacity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing & Capacity</Text>
              
              <Text style={styles.label}>Total Participants *</Text>
              <TextInput
                style={styles.input}
                value={totalParticipants}
                onChangeText={setTotalParticipants}
                placeholder="10"
                keyboardType="numeric"
                maxLength={2}
              />

              <Text style={styles.label}>Price ($) *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="25.00"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            {/* Equipment */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Required Equipment</Text>
              <Text style={styles.sectionSubtitle}>
                Select equipment that participants will need
              </Text>
              
              <View style={styles.equipmentGrid}>
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <TouchableOpacity
                    key={equipment}
                    style={[
                      styles.equipmentChip,
                      selectedEquipment.includes(equipment) && styles.equipmentChipSelected,
                    ]}
                    onPress={() => toggleEquipment(equipment)}
                  >
                    <Text
                      style={[
                        styles.equipmentChipText,
                        selectedEquipment.includes(equipment) && styles.equipmentChipTextSelected,
                      ]}
                    >
                      {equipment}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Banner Image */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Banner Image (Optional)</Text>
              <Text style={styles.sectionSubtitle}>
                Add a banner image to make your session more attractive
              </Text>
              
              {bannerImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: bannerImage }} style={styles.bannerImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <Ionicons name="close-circle" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  <Ionicons name="camera" size={32} color="#A78BFA" />
                  <Text style={styles.imagePickerText}>Add Banner Image</Text>
                  <Text style={styles.imagePickerSubtext}>Tap to select from gallery</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateSession}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="videocam" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create Session</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Pickers */}
      {renderPicker(
        showGoalPicker,
        () => setShowGoalPicker(false),
        GOAL_OPTIONS,
        goal,
        setGoal,
        'Select Fitness Goal'
      )}

      {renderPicker(
        showLevelPicker,
        () => setShowLevelPicker(false),
        LEVEL_OPTIONS,
        level,
        setLevel,
        'Select Difficulty Level'
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  equipmentChipSelected: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  equipmentChipText: {
    fontSize: 14,
    color: '#666',
  },
  equipmentChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A78BFA',
    paddingVertical: 16,
    margin: 20,
    borderRadius: 12,
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerOptions: {
    maxHeight: 400,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#f8f9fa',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  imagePickerButton: {
    alignItems: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A78BFA',
    marginTop: 10,
  },
  imagePickerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default CreateSessionModal; 