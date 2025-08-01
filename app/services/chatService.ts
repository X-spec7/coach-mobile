import { API_BASE_URL } from '../constants/api';
import { getAuthHeaders } from './api';
import { authenticatedFetch } from '../utils/auth';

// Chat interfaces
export interface Message {
  id: number;
  content: string;
  isRead: boolean;
  isSent: boolean;
  sentDate: string;
  senderId?: number; // Add senderId to match web version
}

export interface Contact {
  id: number;
  fullName: string;
  avatarUrl: string | null;
  userType: string;
  unreadCount: number;
  lastMessage?: Message;
}

export interface User {
  id: number;
  fullName: string;
  avatarUrl: string | null;
  userType: string;
}

export interface ChatHistory {
  totalMessageCount: number;
  otherPersonFullname: string;
  otherPersonAvatarUrl: string | null;
  messages: Message[];
}

// Response interfaces
export interface ContactsResponse {
  message: string;
  contacts: Contact[];
}

export interface UsersSearchResponse {
  message: string;
  users: User[];
  totalUsersCount: number;
}

export interface MessagesResponse {
  message: string;
  data: ChatHistory;
}

export interface ReadStatusResponse {
  message: string;
  updatedCount: number;
}

// WebSocket message types - Updated to match web version
export interface WSOutgoingMessage {
  type: string;
  recipient_id?: number;
  message?: string;
  message_sender_id?: number;
  otherPersonId?: number;
  reader_id?: number;
  [key: string]: any; // Allow additional properties
}

export interface WSIncomingMessage {
  type: string;
  message?: Message | { reader_id: number };
  callInfo?: {
    callerId: number;
    callerName: string;
  };
  [key: string]: any; // Allow additional properties
}

// WebSocket Service - Updated to match web singleton pattern
class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private messageHandlers: Record<string, ((data: any) => void)[]> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private userId: number | null = null;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already connected to the same user, resolve immediately
      if (this.ws && this.ws.readyState === WebSocket.OPEN && this.userId === userId) {
        resolve();
        return;
      }

      // Disconnect existing connection if connecting to different user
      if (this.ws && this.userId !== userId) {
        this.disconnect();
      }

      this.userId = userId;

      try {
        // Match web frontend URL pattern - remove the extra /chat/ path
        const wsUrl = `ws://${API_BASE_URL.replace('http://', '').replace('https://', '')}/chat/${userId}/`;
        console.log('[WebSocketService] Connecting to:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[WebSocketService] WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocketService] WebSocket disconnected');
          this.ws = null;
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocketService] WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[WebSocketService] Message received:', data);
            
            const handlers = this.messageHandlers[data.type];
            if (handlers) {
              handlers.forEach((handler) => handler(data));
            }
          } catch (error) {
            console.error('[WebSocketService] Error parsing message:', error);
          }
        };

      } catch (error) {
        console.error('[WebSocketService] Connection error:', error);
        reject(error);
      }
    });
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    console.log(`[WebSocketService] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId).catch(error => {
          console.error('[WebSocketService] Reconnect failed:', error);
        });
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect(): void {
    if (this.ws) {
      console.log('[WebSocketService] Disconnecting...');
      this.ws.close();
      this.ws = null;
      this.userId = null;
    }
  }

  sendMessage(type: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WebSocketService] Sending message:', { type, ...payload });
      this.ws.send(JSON.stringify({ type, ...payload }));
    } else {
      console.error('[WebSocketService] WebSocket is not connected');
    }
  }

  registerOnMessageHandler(type: string, handler: (data: any) => void): void {
    if (!this.messageHandlers[type]) {
      this.messageHandlers[type] = [];
    }
    this.messageHandlers[type].push(handler);
  }

  unRegisterOnMessageHandler(type: string, handler: (data: any) => void): void {
    if (this.messageHandlers[type]) {
      this.messageHandlers[type] = this.messageHandlers[type].filter(
        (h) => h !== handler
      );

      if (this.messageHandlers[type].length === 0) {
        delete this.messageHandlers[type];
      }
    }
  }

  get connectionStatus(): string {
    if (!this.ws) return 'DISCONNECTED';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }

  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const websocketService = WebSocketService.getInstance();

// Legacy ChatWebSocket class for backward compatibility
export class ChatWebSocket {
  private userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  connect(): Promise<void> {
    return websocketService.connect(this.userId);
  }

  disconnect(): void {
    websocketService.disconnect();
  }

  sendMessage(message: WSOutgoingMessage): void {
    websocketService.sendMessage(message.type, message);
  }

  onMessage(handler: (message: WSIncomingMessage) => void): void {
    // Register for all message types
    const messageTypes = ['chat', 'unread_messages_checked', 'incoming_call', 'call_accepted', 'call_declined', 'call_cancelled', 'busy'];
    messageTypes.forEach(type => {
      websocketService.registerOnMessageHandler(type, handler);
    });
  }

  removeMessageHandler(handler: (message: WSIncomingMessage) => void): void {
    const messageTypes = ['chat', 'unread_messages_checked', 'incoming_call', 'call_accepted', 'call_declined', 'call_cancelled', 'busy'];
    messageTypes.forEach(type => {
      websocketService.unRegisterOnMessageHandler(type, handler);
    });
  }

  get isConnected(): boolean {
    return websocketService.isConnected;
  }
}

// REST API service
export const ChatService = {
  // Get contact list
  getContacts: async (): Promise<ContactsResponse> => {
    const url = `${API_BASE_URL}/api/chat/contact/get/`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers: await getAuthHeaders(),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Search users for new conversations
  searchUsers: async (params: {
    limit: number;
    offset: number;
    query?: string;
  }): Promise<UsersSearchResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', params.limit.toString());
    queryParams.append('offset', params.offset.toString());
    if (params.query) {
      queryParams.append('query', params.query);
    }

    const url = `${API_BASE_URL}/api/chat/users/search/?${queryParams.toString()}`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers: await getAuthHeaders(),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Get message history with another user
  getMessages: async (otherPersonId: number, params?: {
    offset?: number;
    limit?: number;
  }): Promise<MessagesResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.offset !== undefined) {
      queryParams.append('offset', params.offset.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_BASE_URL}/api/chat/messages/${otherPersonId}/${queryString}`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers: await getAuthHeaders(),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (otherPersonId: number): Promise<ReadStatusResponse> => {
    const url = `${API_BASE_URL}/api/chat/messages/read/${otherPersonId}/`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'POST',
        headers: await getAuthHeaders(),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },
}; 