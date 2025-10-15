import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { websocketService, WSIncomingMessage, Contact, ChatService } from '../services/chatService';
import { useAuth } from './AuthContext';

interface ChatContextType {
  websocketService: typeof websocketService;
  isConnected: boolean;
  contacts: Contact[];
  unreadMessagesCount: number;
  connectChat: () => Promise<void>;
  disconnectChat: () => void;
  updateContacts: (contacts: Contact[]) => void;
  updateContactLastMessage: (contactId: string, message: any) => void;
  updateContactUnreadCount: (contactId: string, count: number) => void;
  loadContacts: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Calculate total unread messages
  const unreadMessagesCount = contacts.reduce((total, contact) => total + contact.unreadCount, 0);

  const connectChat = useCallback(async (): Promise<void> => {
    console.log('[ChatContext] connectChat called:', {
      userId: user?.id,
      isAlreadyConnected: websocketService.isConnected,
      userExists: !!user
    });
    
    if (!user?.id || websocketService.isConnected) return;

    try {
      await websocketService.connect(user.id);
      setIsConnected(true);
      console.log('[ChatContext] Chat connected successfully');
    } catch (error) {
      console.error('[ChatContext] Failed to connect to chat:', error);
      setIsConnected(false);
      
      // Don't show repeated connection error alerts to avoid spam
      // Just log the error for debugging
    }
  }, [user?.id]);

  const disconnectChat = useCallback((): void => {
    websocketService.disconnect();
    setIsConnected(false);
    console.log('[ChatContext] Chat disconnected');
  }, []);

  const updateContacts = useCallback((newContacts: Contact[]): void => {
    // Filter out the current user from contacts list
    const filteredContacts = newContacts.filter(contact => contact.id !== user?.id);
    setContacts(filteredContacts);
  }, [user?.id]);

  const updateContactLastMessage = useCallback((contactId: string, message: any): void => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, lastMessage: message }
          : contact
      )
    );
  }, []);

  const updateContactUnreadCount = useCallback((contactId: string, count: number): void => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, unreadCount: count }
          : contact
      )
    );
  }, []);

  // Load contacts from API
  const loadContacts = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      console.log('[ChatContext] Loading contacts...');
      const response = await ChatService.getContacts();
      // Filter out the current user from contacts list
      const filteredContacts = response.contacts.filter(contact => contact.id !== user.id);
      setContacts(filteredContacts);
      console.log('[ChatContext] Contacts loaded:', filteredContacts.length, '(filtered from', response.contacts.length, ')');
    } catch (error) {
      console.error('[ChatContext] Failed to load contacts:', error);
      // Don't show user-facing errors for contact loading
    }
  }, [user?.id]);

  // Update connection status based on WebSocket state
  useEffect(() => {
    const checkConnectionStatus = () => {
      const connected = websocketService.connectionStatus === 'OPEN';
      setIsConnected(connected);
    };

    const interval = setInterval(checkConnectionStatus, 2000); // Check every 2 seconds instead of 1
    return () => clearInterval(interval);
  }, []);

  // Auto-connect when user is authenticated
  useEffect(() => {
    console.log('[ChatContext] Auto-connect check:', {
      isAuthenticated,
      userId: user?.id,
      isConnected,
      hasUser: !!user,
      hasUserId: !!user?.id
    });

    if (isAuthenticated && user?.id && !isConnected) {
      console.log('[ChatContext] Attempting auto-connect...');
      // Add a small delay to avoid rapid reconnection attempts
      const connectTimer = setTimeout(() => {
        connectChat();
      }, 1000);
      
      return () => clearTimeout(connectTimer);
    } else if (!isAuthenticated && isConnected) {
      console.log('[ChatContext] Disconnecting due to unauthenticated state.');
      disconnectChat();
    }
  }, [isAuthenticated, user?.id]);

  // Load contacts when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadContacts();
    }
  }, [isAuthenticated, user?.id, loadContacts]);

  const value: ChatContextType = {
    websocketService,
    isConnected,
    contacts,
    unreadMessagesCount,
    connectChat,
    disconnectChat,
    updateContacts,
    updateContactLastMessage,
    updateContactUnreadCount,
    loadContacts,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 