import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useChat } from '../contexts/ChatContext';
import { Contact, ChatService } from '../services/chatService';

interface UnreadMessagesProps {
  maxItems?: number;
}

export default function UnreadMessages({ maxItems = 5 }: UnreadMessagesProps) {
  const { contacts, updateContactUnreadCount, loadContacts, isConnected } = useChat();
  const [loading, setLoading] = React.useState(false);

  // Load contacts on mount if not already loaded
  useEffect(() => {
    const loadContactsIfNeeded = async () => {
      if (contacts.length === 0 && isConnected) {
        setLoading(true);
        try {
          await loadContacts();
        } catch (error) {
          console.error('[UnreadMessages] Failed to load contacts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadContactsIfNeeded();
  }, [isConnected, contacts.length]);

  // Filter contacts with unread messages
  const unreadContacts = contacts.filter(contact => contact.unreadCount > 0);

  // Limit the number of items displayed
  const displayedContacts = maxItems ? unreadContacts.slice(0, maxItems) : unreadContacts;

  const handleContactPress = (contact: Contact) => {
    // Mark messages as read when user taps on the contact
    if (contact.unreadCount > 0) {
      updateContactUnreadCount(contact.id, 0);
      // Also mark messages as read on the backend
      ChatService.markMessagesAsRead(contact.id).catch(error => {
        console.error('Error marking messages as read:', error);
      });
    }
    
    router.push({
      pathname: '/chat',
      params: {
        userId: contact.id,
        userName: contact.fullName,
        userAvatar: contact.avatarUrl || '',
      },
    });
  };

  const handleDismissMessage = async (contactId: string) => {
    // Set unread count to 0 for this contact
    updateContactUnreadCount(contactId, 0);
    // Mark messages as read for this contact on the backend
    await ChatService.markMessagesAsRead(contactId);
  };

  const formatLastMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const renderUnreadContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.messageCard}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.messageHeader}>
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color="#A78BFA" />
          </View>
        )}
        
        <View style={styles.messageInfo}>
          <View style={styles.messageRow}>
            <Text style={styles.senderName}>{item.fullName}</Text>
            <View style={styles.messageActions}>
              {item.lastMessage && (
                <Text style={styles.messageTime}>
                  {formatLastMessageTime(item.lastMessage.sentDate)}
                </Text>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => handleDismissMessage(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.messageRow}>
            <Text style={styles.userType}>{item.userType}</Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
          
          {item.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={2}>
              {item.lastMessage.content}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Messages</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#A78BFA" />
          <Text style={styles.loadingText}>Loading unread messages...</Text>
        </View>
      </View>
    );
  }

  if (unreadContacts.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Messages</Text>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => router.push('/chat-contacts')}
          >
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="arrow-forward" size={16} color="#A78BFA" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.container}>
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No unread messages</Text>
            <Text style={styles.emptyStateSubtext}>
              Stay connected with your coaches and clients
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Unread Messages</Text>
        <Text style={styles.headerCount}>
          {unreadContacts.length} {unreadContacts.length === 1 ? 'message' : 'messages'}
        </Text>
      </View>
      
      <View style={styles.container}>
        <FlatList
          data={displayedContacts}
          renderItem={renderUnreadContact}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Disable scrolling since we're limiting items
        />
        
        {unreadContacts.length > maxItems && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/chat-contacts')}
          >
            <Text style={styles.viewAllText}>
              View all {unreadContacts.length} messages
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#A78BFA" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerCount: {
    fontSize: 14,
    color: '#666',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageInfo: {
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  userType: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '500',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}); 