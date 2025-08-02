import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { ChatService, Message, WSIncomingMessage } from '../services/chatService';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

interface ChatParams {
  userId: string;
  userName: string;
  userAvatar?: string;
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { websocketService, isConnected } = useChat();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);
  const messageHandlerRef = useRef<((data: any) => void) | null>(null);
  const unreadHandlerRef = useRef<((data: any) => void) | null>(null);
  
  const otherUserId = params.userId as string; // Remove parseInt() to preserve UUID format
  const otherUserName = params.userName as string;
  const otherUserAvatar = params.userAvatar as string;

  useEffect(() => {
    loadInitialMessages();
    setupMessageHandlers();
    markMessagesAsRead();

    return () => {
      cleanupMessageHandlers();
    };
  }, []);

  const loadInitialMessages = async () => {
    setLoading(true);
    try {
      const response = await ChatService.getMessages(otherUserId, {
        limit: 20,
        offset: 0,
      });
      
      // Messages come in reverse chronological order (newest first)
      setMessages(response.data.messages.reverse());
      setHasMoreMessages(response.data.messages.length === 20);
    } catch (error) {
      console.error('Error loading messages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
      
      if (!errorMessage.includes('Authentication required')) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMoreMessages) return;

    setLoadingMore(true);
    try {
      const response = await ChatService.getMessages(otherUserId, {
        limit: 20,
        offset: messages.length,
      });
      
      if (response.data.messages.length > 0) {
        // Prepend older messages (they come newest first, so reverse and prepend)
        const olderMessages = response.data.messages.reverse();
        setMessages(prev => [...olderMessages, ...prev]);
        
        // Important: Only set hasMoreMessages to true if we got exactly the limit
        // If we got less than the limit, we've reached the end
        setHasMoreMessages(response.data.messages.length === 20);
      } else {
        // No more messages available
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      // Stop trying to load more messages on error
      setHasMoreMessages(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const setupMessageHandlers = () => {
    // Handle incoming messages
    const handleMessageReceived = (data: any) => {
      if (data.message && (data.message.senderId === otherUserId || data.message.senderId === user?.id)) {
        setMessages((prev) => [...prev, data.message]);
        
        // Auto-scroll to bottom for new messages
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Mark as read if it's an incoming message
        if (data.message.senderId === otherUserId) {
          markMessagesAsRead();
        }

        // Send acknowledgment that message was received
        if (websocketService.isConnected) {
          websocketService.sendMessage('checked_received_message', {
            message_sender_id: data.message.senderId
          });
        }
      }
    };

    // Handle read status updates
    const handleUnreadMessagesChecked = (data: any) => {
      if (data.message && data.message.reader_id === otherUserId) {
        setMessages((prevMessages) => {
          const lastUnreadIndex = prevMessages.findLastIndex((msg) => !msg.isRead);
          
          // If all messages are already read, return early
          if (lastUnreadIndex === -1) return prevMessages;

          return prevMessages.map((msg, index) =>
            index <= lastUnreadIndex ? { ...msg, isRead: true } : msg
          );
        });
      }
    };

    // Register handlers
    messageHandlerRef.current = handleMessageReceived;
    unreadHandlerRef.current = handleUnreadMessagesChecked;
    
    websocketService.registerOnMessageHandler('chat', handleMessageReceived);
    websocketService.registerOnMessageHandler('unread_messages_checked', handleUnreadMessagesChecked);
  };

  const cleanupMessageHandlers = () => {
    if (messageHandlerRef.current) {
      websocketService.unRegisterOnMessageHandler('chat', messageHandlerRef.current);
    }
    if (unreadHandlerRef.current) {
      websocketService.unRegisterOnMessageHandler('unread_messages_checked', unreadHandlerRef.current);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Check if WebSocket is connected
      if (websocketService.isConnected) {
        // Send via WebSocket using the web pattern
        websocketService.sendMessage('send_message', {
          recipient_id: otherUserId,
          message: messageText,
        });
      } else {
        // WebSocket not connected, show user-friendly message
        Alert.alert(
          'Connection Issue', 
          'Unable to send message. Please check your connection and try again.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
        // Restore the message text so user doesn't lose it
        setNewMessage(messageText);
        return;
      }

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Restore the message text so user doesn't lose it
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await ChatService.markMessagesAsRead(otherUserId);
      
      // Notify via WebSocket using web pattern (only if connected)
      if (websocketService.isConnected) {
        websocketService.sendMessage('checked_unread_messages', {
          reader_id: user?.id,
          message_sender_id: otherUserId,
        });
      }

      // Update local messages as read
      setMessages(prev => 
        prev.map(msg => 
          !msg.isSent ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // Don't show alert for this as it's not critical for user experience
    }
  };

  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isConsecutive = index > 0 && 
      messages[index - 1].isSent === item.isSent &&
      new Date(item.sentDate).getTime() - new Date(messages[index - 1].sentDate).getTime() < 60000; // Within 1 minute

    return (
      <View style={[
        styles.messageContainer,
        item.isSent ? styles.sentMessageContainer : styles.receivedMessageContainer,
        isConsecutive && styles.consecutiveMessage,
      ]}>
        <View style={[
          styles.messageBubble,
          item.isSent ? styles.sentMessage : styles.receivedMessage,
        ]}>
          <Text style={[
            styles.messageText,
            item.isSent ? styles.sentMessageText : styles.receivedMessageText,
          ]}>
            {item.content}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              item.isSent ? styles.sentMessageTime : styles.receivedMessageTime,
            ]}>
              {formatMessageTime(item.sentDate)}
            </Text>
            
            {item.isSent && (
              <Ionicons
                name={item.isRead ? "checkmark-done" : "checkmark"}
                size={14}
                color={item.isRead ? "#4CAF50" : "#B0B0B0"}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderListHeader = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color="#A78BFA" />
        <Text style={styles.loadingMoreText}>Loading more messages...</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          {otherUserAvatar ? (
            <Image
              source={{ uri: otherUserAvatar }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Ionicons name="person" size={20} color="#A78BFA" />
            </View>
          )}
          
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{otherUserName}</Text>
            <Text style={styles.headerSubtitle}>
              {isConnected ? 'Online' : 'Connecting...'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="videocam-outline" size={24} color="#A78BFA" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        ListHeaderComponent={renderListHeader}
        onEndReached={hasMoreMessages && !loadingMore ? loadMoreMessages : null}
        onEndReachedThreshold={0.5}
        inverted={false}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          // Auto-scroll to bottom on initial load
          if (messages.length > 0 && !loadingMore) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);
          }
        }}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            multiline
            maxLength={1000}
            editable={!sending}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  callButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  messageContainer: {
    marginVertical: 2,
  },
  sentMessageContainer: {
    alignItems: 'flex-end',
  },
  receivedMessageContainer: {
    alignItems: 'flex-start',
  },
  consecutiveMessage: {
    marginTop: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  sentMessage: {
    backgroundColor: '#A78BFA',
    borderBottomRightRadius: 6,
  },
  receivedMessage: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentMessageText: {
    color: '#fff',
  },
  receivedMessageText: {
    color: '#1a1a1a',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  sentMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedMessageTime: {
    color: '#666',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
}); 