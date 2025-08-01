import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { websocketService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

export default function WebSocketTest() {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(websocketService.connectionStatus);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleTestMessage = (data: any) => {
      console.log('[WebSocketTest] Received message:', data);
      setLastMessage(data);
    };

    websocketService.registerOnMessageHandler('chat', handleTestMessage);
    websocketService.registerOnMessageHandler('test', handleTestMessage);

    return () => {
      websocketService.unRegisterOnMessageHandler('chat', handleTestMessage);
      websocketService.unRegisterOnMessageHandler('test', handleTestMessage);
    };
  }, []);

  const testConnect = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'No user ID available');
      return;
    }

    try {
      console.log('[WebSocketTest] Attempting to connect with user ID:', user.id);
      await websocketService.connect(user.id);
      console.log('[WebSocketTest] Connection attempt completed');
    } catch (error) {
      console.error('[WebSocketTest] Connection failed:', error);
      Alert.alert('Connection Failed', JSON.stringify(error));
    }
  };

  const testDisconnect = () => {
    websocketService.disconnect();
  };

  const testSendMessage = () => {
    if (websocketService.connectionStatus === 'OPEN') {
      websocketService.sendMessage('test', {
        message: 'Test message from React Native',
        timestamp: new Date().toISOString(),
      });
    } else {
      Alert.alert('Error', 'WebSocket not connected');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'OPEN': return '#4CAF50';
      case 'CONNECTING': return '#FFA726';
      case 'CLOSING': return '#FF7043';
      case 'CLOSED': 
      case 'DISCONNECTED': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.label}>Status:</Text>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {connectionStatus}
        </Text>
      </View>

      <Text style={styles.label}>User ID: {user?.id || 'Not available'}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testConnect}>
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testDisconnect}>
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testSendMessage}>
          <Text style={styles.buttonText}>Send Test</Text>
        </TouchableOpacity>
      </View>

      {lastMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.label}>Last Message:</Text>
          <Text style={styles.messageText}>
            {JSON.stringify(lastMessage, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginRight: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  messageContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  messageText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
}); 