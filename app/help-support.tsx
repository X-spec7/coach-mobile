import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I connect with a coach?',
    answer: 'You can find coaches by going to the "Find Coaches" section in the activity tab. Browse through available coaches and send them a connection request.',
    category: 'Connections'
  },
  {
    id: '2',
    question: 'How do I track my workouts?',
    answer: 'Go to the "Scheduled Workouts" section to view your assigned workouts. Mark them as completed and track your progress over time.',
    category: 'Workouts'
  },
  {
    id: '3',
    question: 'Can I create my own meal plans?',
    answer: 'Yes! Go to the "Meal Plans" tab and tap the "+" button to create your own meal plan. You can customize it with your favorite foods and nutritional goals.',
    category: 'Meal Plans'
  },
  {
    id: '4',
    question: 'How do I update my profile information?',
    answer: 'Go to the Profile tab and select "Personal Information" to update your details, preferences, and settings.',
    category: 'Profile'
  },
  {
    id: '5',
    question: 'What if I forget my password?',
    answer: 'On the login screen, tap "Forgot Password" and follow the instructions to reset your password via email.',
    category: 'Account'
  },
  {
    id: '6',
    question: 'How do I join live sessions?',
    answer: 'Go to the "Live Sessions" section in the activity tab to browse available sessions. Tap on a session to join and participate.',
    category: 'Sessions'
  },
  {
    id: '7',
    question: 'Can I export my fitness data?',
    answer: 'Currently, data export is available through the Privacy & Security settings. Go to Profile > Privacy & Security > Export Data.',
    category: 'Data'
  },
  {
    id: '8',
    question: 'How do I manage my notifications?',
    answer: 'Go to Profile > Notifications to customize which notifications you receive and when.',
    category: 'Settings'
  }
];

export default function HelpSupportScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQ = selectedCategory === 'All' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message fields.');
      return;
    }

    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/support/send-email/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     ...getAuthHeaders(),
      //   },
      //   body: JSON.stringify({
      //     subject: subject.trim(),
      //     message: message.trim(),
      //     category: 'general',
      //     priority: 'medium',
      //   }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to send email');
      // }

      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Email Sent',
        'Your support request has been sent successfully. We\'ll get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSubject('');
              setMessage('');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send email. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Email Support Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter your subject"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.textInput, styles.messageInput]}
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue or question"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity style={styles.sendButton} onPress={handleSendEmail}>
              <Ionicons name="mail" size={20} color="#fff" />
              <Text style={styles.sendButtonText}>Send Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ Items */}
          <View style={styles.faqContainer}>
            {filteredFAQ.map((item) => (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(item.id)}
                >
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  <Ionicons
                    name={expandedFAQ === item.id ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
                {expandedFAQ === item.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={20} color="#666" />
              <Text style={styles.contactText}>support@coachmobile.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color="#666" />
              <Text style={styles.contactText}>+1 (234) 567-8900</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.contactText}>Mon-Fri 9AM-6PM EST</Text>
            </View>
          </View>
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
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  formContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageInput: {
    height: 100,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A26FFD',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#A26FFD',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  faqContainer: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
}); 